import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSessionLeaveGuard } from '@/composables/useSessionLeaveGuard'
import { useRouter } from 'vue-router'
import { useTestSessionStore } from '@/stores/testSessionStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useAnswerSubmission } from '@/composables/useAnswerSubmission'
import { isModalOpen } from '@/composables/useModalStack'
import { useTestNavigation } from '@/composables/useTestNavigation'
import { useNotify } from '@/composables/useNotify'
import { useDialog } from '@/composables/useDialog'
import { useSound } from '@/composables/useSound'
import { i18n } from '@/i18n'
import { normalizeConfidenceScore } from '@/utils/confidence'
import { sessionGeneration } from '@/services/api/sessionScope'

export function useTestQuestionController(modeRef) {
  const router = useRouter()
  const store = useTestSessionStore()
  const preferencesStore = usePreferencesStore()
  const { notify } = useNotify()
  const { confirm } = useDialog()
  const { playClick } = useSound()
  const { submitting, submitAnswer } = useAnswerSubmission(store)
  const t = i18n.global.t

  const mode = () => (typeof modeRef === 'function' ? modeRef() : modeRef.value)

  const question = ref(null)
  const selectedAnswer = ref(null)
  const startTime = ref(null)
  const swipeContainer = ref(null)
  const confidence = ref(3)
  const reflectionReason = ref('unknown')
  const reflectionSaved = ref(false)
  const preAnswer = ref('')
  const choicesRevealed = ref(false)
  const showReflectionPrompt = ref(false)
  const interactionBusy = ref(false)
  const questionLoadFailed = ref(false)
  const tickedRemaining = ref(null)

  let autoFinishTriggered = false
  let advanceTimer = null
  let pendingSubmission = null
  const finishing = ref(false)
  let disposed = false
  const submissionRecoveryRequired = computed(() => store.submissionRecoveryRequired)
  const submissionDraft = computed(() => store.pendingSubmission)
  const submissionReview = computed(() => store.submissionReview)
  const canRetrySubmission = computed(() => {
    const draft = submissionDraft.value
    const review = submissionReview.value
    if (!draft || !review?.status?.is_active || !review.page || review.page.index !== draft.index || review.page.question.id !== draft.question.id) return false
    const page = review.page
    const baseline = { answer: page.saved_answer ?? null, confidence: page.saved_confidence ?? null,
      pre_answer: page.saved_pre_answer || null, error_reason: page.saved_error_reason || null }
    return Object.keys(baseline).every((key) => baseline[key] === draft.baseline[key])
  })

  useSessionLeaveGuard({
    active: () => store.isActive || submissionRecoveryRequired.value,
    busy: () => submitting.value || interactionBusy.value || finishing.value || submissionRecoveryRequired.value,
    beforeLeave: clearAdvanceTimer,
  })

  const examTotalSeconds = computed(() => {
    if (['exam', 'study', 'recall'].includes(mode()) && store.durationMinutes) {
      return store.durationMinutes * 60
    }
    return null
  })

  const isCritical = computed(() => {
    if (examTotalSeconds.value === null || tickedRemaining.value === null) {
      return false
    }
    if (tickedRemaining.value <= 0) return false
    return tickedRemaining.value / examTotalSeconds.value <= 0.1
  })

  const confidenceForCurrent = computed(() => {
    const stored = store.confidence[store.currentIndex]
    if (stored !== undefined) return normalizeConfidenceScore(stored)
    return 3
  })

  const needsConfidence = computed(() => (
    (mode() === 'study' || mode() === 'recall')
    && selectedAnswer.value !== null
    && selectedAnswer.value !== undefined
    && confidence.value === null
  ))

  const pauseDisabled = computed(() => (
    submitting.value || interactionBusy.value || finishing.value || submissionRecoveryRequired.value || needsConfidence.value
  ))
  const navigationDisabled = computed(() => (
    pauseDisabled.value
    || (mode() === 'recall' && (!choicesRevealed.value || selectedAnswer.value == null))
  ))
  const answerControlsBusy = computed(() => (
    submitting.value || interactionBusy.value || finishing.value || submissionRecoveryRequired.value || questionLoadFailed.value || !store.answerBaseline
  ))

  function onTimerTick({ remaining }) {
    tickedRemaining.value = remaining
  }

  function track(promise) {
    pendingSubmission = promise.then(async (response) => {
      // Older backends do not return saved_slot. Refresh without replaying a
      // confirmed mutation; failed reads use the normal question Retry UI.
      if (!disposed && !store.answerBaseline && store.currentIndex < store.totalQuestions && !store.submissionRecoveryRequired) await loadQuestion()
      return response
    })
    return pendingSubmission
  }

  function clearAdvanceTimer() {
    if (!advanceTimer) return
    clearTimeout(advanceTimer)
    advanceTimer = null
  }

  function handleSubmissionFailure(error, fallbackKey) {
    if (disposed || error?.code === 'CANCEL') return
    if (error?.code === 409 && error?.details?.code === 'TIME_EXPIRED' && mode() === 'exam') {
      if (!autoFinishTriggered) {
        autoFinishTriggered = true
        notify(t('tests.timeUp'), 'warning')
      }
      finish({ forced: true })
      return
    }
    notify(error?.message || t(fallbackKey), 'error')
  }

  function mergeFeedbackTranslations(translations) {
    if (!question.value || !translations || typeof translations !== 'object') return
    const current = question.value.translations || {}
    question.value.translations = Object.fromEntries(
      Object.entries({ ...current, ...translations }).map(([locale, content]) => [
        locale,
        { ...(current[locale] || {}), ...(content || {}) },
      ]),
    )
  }

  function maybeScheduleAdvance(questionId, delay = 400) {
    if (!preferencesStore.autoAdvance) return
    if (needsConfidence.value) return
    scheduleAdvance(questionId, delay)
  }

  async function loadQuestion() {
    if (disposed) return
    if (submissionRecoveryRequired.value) {
      restoreAttemptedDraft()
      return
    }
    if (store.isComplete) {
      router.push(`/${mode()}/results`)
      return
    }

    questionLoadFailed.value = false
    const owner = store.sessionId
    const generation = sessionGeneration()
    const request = store.fetchQuestion()
    const epoch = store.requestEpoch
    const response = await request
    if (disposed || store.sessionId !== owner || generation !== sessionGeneration() || store.requestEpoch !== epoch || submissionRecoveryRequired.value) return
    if (!response) {
      if (store.status === 'error') {
        question.value = null
        questionLoadFailed.value = true
        return
      }
      if (!store.isComplete) await finish()
      else router.push(`/${mode()}/results`)
      return
    }

    question.value = response.question
    selectedAnswer.value = store.answers[store.currentIndex] || null
    confidence.value = normalizeConfidenceScore(response.saved_confidence ?? confidenceForCurrent.value)
    preAnswer.value = response.saved_pre_answer || ''
    choicesRevealed.value = mode() !== 'recall' || !response.question?.choices_hidden
    showReflectionPrompt.value = (mode() === 'study' || mode() === 'recall') && response.saved_is_correct === false
    reflectionReason.value = response.saved_error_reason || 'unknown'
    reflectionSaved.value = Boolean(response.saved_error_reason)

    const baseMs = store.startedAt ? new Date(store.startedAt).getTime() : Date.now()
    const accumulatedMs = (store.accumulatedTime || 0) * 1000
    startTime.value = new Date(baseMs - accumulatedMs)
  }

  async function handleConfidence(value) {
    if (interactionBusy.value || submitting.value) return
    confidence.value = value
    if (selectedAnswer.value === null || selectedAnswer.value === undefined) {
      return
    }

    const submittedQuestionId = store.currentQuestionId
    interactionBusy.value = true
    try {
      await track(submitAnswer(selectedAnswer.value, 'same', null, value))
    } catch (error) {
      handleSubmissionFailure(error, 'tests.confidenceSaveFailed')
      return
    } finally {
      interactionBusy.value = false
    }
    maybeScheduleAdvance(submittedQuestionId)
  }

  function handleAnswer(answer) {
    if (answerControlsBusy.value) return
    if ((mode() === 'study' || mode() === 'recall') && store.hasAnswer(store.currentIndex)) return
    selectedAnswer.value = answer
    showReflectionPrompt.value = false
    reflectionReason.value = 'unknown'
    reflectionSaved.value = false
    if (preferencesStore.soundEffects) playClick()
    saveAnswer()
  }

  async function handleReveal(value) {
    const clean = String(value || '').trim()
    if (!clean || submitting.value || interactionBusy.value) return
    preAnswer.value = clean
    interactionBusy.value = true
    try {
      await track(submitAnswer(null, 'same', null, confidence.value, null, clean))
      await loadQuestion()
    } catch (error) {
      handleSubmissionFailure(error, 'tests.recallSaveFailed')
    } finally {
      interactionBusy.value = false
    }
  }

  watch(isModalOpen, (open) => { if (open) clearAdvanceTimer() })

  function scheduleAdvance(questionId, delay) {
    clearAdvanceTimer()
    if (isModalOpen.value) return
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      if (store.currentQuestionId !== questionId) return
      if (store.currentIndex < store.totalQuestions - 1) goNext()
      else finish()
    }, delay)
  }

  async function handleReflection(reason) {
    if (reflectionSaved.value) return
    if (selectedAnswer.value === null || selectedAnswer.value === undefined) {
      return
    }
    if (interactionBusy.value || submitting.value) return

    const submittedQuestionId = store.currentQuestionId
    reflectionReason.value = reason
    interactionBusy.value = true
    try {
      await track(submitAnswer(selectedAnswer.value, 'same', null, confidence.value, reason))
    } catch (error) {
      handleSubmissionFailure(error, 'tests.reflectionSaveFailed')
      return
    } finally {
      interactionBusy.value = false
    }

    reflectionReason.value = reason
    reflectionSaved.value = true
    maybeScheduleAdvance(submittedQuestionId)
  }

  async function saveAnswer() {
    if (interactionBusy.value || submitting.value) return
    clearAdvanceTimer()
    const submittedValue = selectedAnswer.value
    const submittedConfidence = confidence.value
    const submittedQuestionId = store.currentQuestionId
    let response

    interactionBusy.value = true
    try {
      response = await track(submitAnswer(submittedValue, 'same', null, submittedConfidence))
    } catch (error) {
      handleSubmissionFailure(error, 'tests.answerSaveFailed')
      return
    } finally {
      interactionBusy.value = false
    }

    if ((mode() === 'study' || mode() === 'recall') && response) {
      if (response.explanation) question.value.explanation = response.explanation
      mergeFeedbackTranslations(response.feedback_translations)
      if (response.is_correct === false) {
        showReflectionPrompt.value = true
        reflectionReason.value = 'unknown'
      }
    }

    if (
      preferencesStore.autoAdvance &&
      !needsConfidence.value &&
      selectedAnswer.value === submittedValue &&
      store.currentQuestionId === submittedQuestionId
    ) {
      scheduleAdvance(submittedQuestionId, 600)
    }
  }

  async function goNext() {
    if (navigationDisabled.value) return
    clearAdvanceTimer()
    if (store.currentIndex >= store.totalQuestions - 1) {
      await finish()
      return
    }

    interactionBusy.value = true
    try {
      await track(submitAnswer(selectedAnswer.value, 'next', null, confidence.value, showReflectionPrompt.value ? reflectionReason.value : null))
      await loadQuestion()
    } catch (error) {
      handleSubmissionFailure(error, 'tests.answerSaveFailed')
      return
    } finally {
      interactionBusy.value = false
    }
  }

  async function goPrevious() {
    if (navigationDisabled.value) return
    clearAdvanceTimer()
    interactionBusy.value = true
    try {
      await track(submitAnswer(showReflectionPrompt.value ? selectedAnswer.value : null, 'previous', null, confidence.value, showReflectionPrompt.value ? reflectionReason.value : null))
      await loadQuestion()
    } catch (error) {
      handleSubmissionFailure(error, 'tests.navigationFailed')
      return
    } finally {
      interactionBusy.value = false
    }
  }

  async function goTo(index) {
    if (index === store.currentIndex || navigationDisabled.value) return
    clearAdvanceTimer()
    interactionBusy.value = true
    try {
      await track(submitAnswer(selectedAnswer.value, 'goto', index, confidence.value, showReflectionPrompt.value ? reflectionReason.value : null))
      await loadQuestion()
    } catch (error) {
      handleSubmissionFailure(error, 'tests.navigationFailed')
      return
    } finally {
      interactionBusy.value = false
    }
  }

  async function pauseSession() {
    if (pauseDisabled.value) return
    if (!(await confirm(t('tests.pauseConfirm'))) || pauseDisabled.value) return
    interactionBusy.value = true
    clearAdvanceTimer()
    try {
      if (showReflectionPrompt.value && !reflectionSaved.value) {
        await track(submitAnswer(selectedAnswer.value, 'same', null, confidence.value, reflectionReason.value))
        reflectionSaved.value = true
      }
      const result = await store.pause()
      if (result) router.push(`/${mode()}`)
    } catch (error) {
      handleSubmissionFailure(error, 'tests.reflectionSaveFailed')
    } finally {
      interactionBusy.value = false
    }
  }

  async function finish({ forced = false } = {}) {
    if (finishing.value || submissionRecoveryRequired.value || (!forced && navigationDisabled.value)) return
    finishing.value = true
    try {
      clearAdvanceTimer()
      if (pendingSubmission) {
        try {
          await pendingSubmission
        } catch {
          // The initiating action already surfaces submission failures.
        }
        pendingSubmission = null
      }

      if (!forced && showReflectionPrompt.value && !reflectionSaved.value) {
        await track(submitAnswer(selectedAnswer.value, 'same', null, confidence.value, reflectionReason.value))
        reflectionSaved.value = true
      }
      const result = await store.finish({ forced })
      if (result) router.push(`/${mode()}/results`)
    } catch (error) {
      notify(error?.message || t('tests.finishFailed'), 'error')
    } finally {
      finishing.value = false
    }
  }

  function restoreAttemptedDraft() {
    const draft = submissionDraft.value
    if (!draft) return
    question.value = draft.question
    selectedAnswer.value = draft.answer ?? draft.baseline.answer
    confidence.value = draft.confidence ?? draft.baseline.confidence ?? 3
    preAnswer.value = draft.preAnswer ?? draft.baseline.pre_answer ?? ''
    reflectionReason.value = draft.errorReason ?? draft.baseline.error_reason ?? 'unknown'
  }

  async function readSubmissionState() {
    if (interactionBusy.value || submitting.value) return
    clearAdvanceTimer()
    interactionBusy.value = true
    try {
      await store.readSubmissionState()
    } catch (error) {
      notify(error?.message || t('tests.reviewProgressRequired'), 'error')
    } finally {
      interactionBusy.value = false
    }
  }

  async function useSavedProgress() {
    if (interactionBusy.value || submitting.value) return
    interactionBusy.value = true
    try {
      const review = store.acceptSubmissionReview()
      if (!review) return
      if (review.result) router.push(`/${mode()}/results`)
      else if (review.missing || !review.status.is_active) router.push(`/${mode()}`)
      else if (review.status.current_index >= store.totalQuestions) await finish({ forced: true })
      else await loadQuestion()
    } finally {
      interactionBusy.value = false
    }
  }

  async function retryReviewedSubmission() {
    if (!canRetrySubmission.value || interactionBusy.value || submitting.value) return
    const draft = submissionDraft.value
    store.acceptSubmissionReview()
    interactionBusy.value = true
    try {
      await track(submitAnswer(draft.answer, draft.action, draft.targetIndex, draft.confidence, draft.errorReason, draft.preAnswer))
      await loadQuestion()
    } catch (error) {
      handleSubmissionFailure(error, 'tests.answerSaveFailed')
    } finally {
      interactionBusy.value = false
    }
  }

  const { setup: setupNavigation, cleanup: cleanupNavigation } = useTestNavigation({
    onNext: goNext,
    onPrevious: goPrevious,
    onAnswer: handleAnswer,
    enabled: () => !answerControlsBusy.value && (mode() !== 'recall' || choicesRevealed.value),
  })

  watch([tickedRemaining, submissionRecoveryRequired, submitting, interactionBusy, finishing], ([remaining, recovering, saving, busy, completing]) => {
    if (recovering || saving || busy || completing) return
    if (remaining === null || remaining > 0 || mode() !== 'exam') return
    if (autoFinishTriggered) return
    autoFinishTriggered = true
    notify(t('tests.timeUp'), 'warning')
    finish({ forced: true })
  })

  onMounted(async () => {
    if (!store.isActive && !store.questionIds?.length) {
      await store.restoreFullState?.()
      if (!store.isActive) {
        router.push(`/${mode()}`)
        return
      }
    }
    await loadQuestion()
    if (swipeContainer.value) setupNavigation(swipeContainer.value)
  })

  onBeforeUnmount(() => {
    disposed = true
    clearAdvanceTimer()
    if (swipeContainer.value) cleanupNavigation(swipeContainer.value)
  })

  return {
    store,
    submissionRecoveryRequired,
    submissionDraft,
    submissionReview,
    canRetrySubmission,
    readSubmissionState,
    useSavedProgress,
    retryReviewedSubmission,
    question,
    selectedAnswer,
    confidence,
    reflectionReason,
    reflectionSaved,
    startTime,
    swipeContainer,
    showReflectionPrompt,
    questionLoadFailed,
    submitting,
    navigationDisabled,
    pauseDisabled,
    answerControlsBusy,
    examTotalSeconds,
    isCritical,
    confidenceForCurrent,
    preAnswer,
    choicesRevealed,
    onTimerTick,
    retryLoadQuestion: loadQuestion,
    handleAnswer,
    handleConfidence,
    handleReveal,
    handleReflection,
    goNext,
    goPrevious,
    goTo,
    pauseSession,
    finish,
  }
}
