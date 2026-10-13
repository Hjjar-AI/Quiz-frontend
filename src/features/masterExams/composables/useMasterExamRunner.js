import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { normalizeConfidenceScore } from '@/utils/confidence'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMasterExamStore } from '@/stores/masterExamStore'
import { useMasterExamAttemptStore } from '@/stores/masterExamAttemptStore'
import { useDialog } from '@/composables/useDialog'
import { useSessionLeaveGuard } from '@/composables/useSessionLeaveGuard'
import { useCountdownAnnouncements } from '@/composables/useCountdownAnnouncements'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import { formatTime } from '@/utils/timer'

export function useMasterExamRunner() {
  let alive=true
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const masterExamStore = useMasterExamStore()
  const attemptStore = useMasterExamAttemptStore()
  const { confirm, prompt: promptDialog } = useDialog()

  const examId = computed(() => Number(route.params.id))
  const isPreview = computed(() => route.query.preview === '1')
  const showPreStart = ref(true)
  const preCountdownActive = ref(false)
  const preCountdownValue = ref(5)
  const finishing = ref(false)
  let preCountdownTimer = null
  let timerInterval = null

  const currentIndex = computed(() => attemptStore.currentIndex)
  const answerSubmitting = computed(() => attemptStore.isAnswerLoading || attemptStore.isLoading || attemptStore.needsReview || finishing.value)
  useSessionLeaveGuard({
    active: () => Boolean(attemptStore.sessionId) && !attemptStore.isComplete,
    busy: () => attemptStore.isAnswerLoading || attemptStore.isLoading || finishing.value,
  })
  const currentSavedAnswer = computed(() => {
    const raw = attemptStore.answers[String(attemptStore.currentQuestionId)]
    return attemptStore.pendingAnswer?.questionId===attemptStore.currentQuestionId ? attemptStore.pendingAnswer.answer : raw ? raw.answer : null
  })

  const currentConfidence = ref(3)
  watch(
    currentSavedAnswer,
    () => {
      const raw = attemptStore.answers[String(attemptStore.currentQuestionId)]
      currentConfidence.value = normalizeConfidenceScore(raw?.confidence)
    },
    { immediate: true },
  )

  const nowTick = ref(Date.now())
  const remainingMs = computed(() => {
    if (!attemptStore.deadlineAt) return null
    const serverNow = nowTick.value + attemptStore.serverOffsetMs
    return Math.max(0, new Date(attemptStore.deadlineAt).getTime() - serverNow)
  })
  const { announcement: timerAnnouncement, status: timerStatus } = useCountdownAnnouncements({
    remaining: () => remainingMs.value === null ? null : remainingMs.value / 1000,
    total: () => attemptStore.durationMinutes * 60,
    sessionKey: () => attemptStore.sessionId,
    announceTimeUp: false, // The grace-window alert owns the time-up announcement.
  })
  const graceMs = computed(() => {
    if (!attemptStore.deadlineAt) return null
    const serverNow = nowTick.value + attemptStore.serverOffsetMs
    const deadline = new Date(attemptStore.deadlineAt).getTime()
    const grace = (attemptStore.graceSeconds || 180) * 1000
    return Math.max(0, deadline + grace - serverNow)
  })
  const timerDisplay = computed(() => {
    if (remainingMs.value === null) return '—'
    return formatTime(Math.floor(remainingMs.value / 1000))
  })
  const graceDisplay = computed(() => {
    if (graceMs.value === null) return '00:00'
    return formatTime(Math.floor(graceMs.value / 1000))
  })
  const timerClass = computed(() => {
    if (remainingMs.value === null) return ''
    const totalMs = (attemptStore.durationMinutes || 30) * 60 * 1000
    const ratio = remainingMs.value / totalMs
    if (attemptStore.inGraceWindow) return 'master-exam-runner__timer--grace'
    if (ratio <= 0.1) return 'master-exam-runner__timer--critical'
    if (ratio <= 0.2) return 'master-exam-runner__timer--warning'
    return ''
  })

  async function loadCurrent() {
    await attemptStore.fetchCurrentQuestion()
  }

  async function doStart() {
    const id=examId.value
    const result = await attemptStore.start(id, { preview: isPreview.value })
    if(!alive || id!==examId.value || attemptStore.examId!==id) return
    if (!result) {
      router.push('/master-exams')
      return
    }
    if(attemptStore.isComplete) {navigateAfterFinish();return}
    await loadCurrent()
  }

  function beginCountdown() {
    if (preCountdownTimer) clearInterval(preCountdownTimer)
    showPreStart.value = false
    preCountdownActive.value = true
    preCountdownValue.value = 5
    let value = 5
    preCountdownTimer = setInterval(() => {
      value -= 1
      preCountdownValue.value = value
      if (value <= 0) {
        clearInterval(preCountdownTimer)
        preCountdownTimer = null
        preCountdownActive.value = false
        doStart()
      }
    }, 1000)
  }

  function cancelCountdown() {
    if (preCountdownTimer) {
      clearInterval(preCountdownTimer)
      preCountdownTimer = null
    }
    preCountdownActive.value = false
    showPreStart.value = true
  }

  async function reviewAnswer() {const id=examId.value;await attemptStore.reviewPending();if(alive && id===examId.value && !attemptStore.needsReview) await loadCurrent()}
  async function keepAnswerDraft() {const id=examId.value;const result=await attemptStore.retryPending();if(result && alive && id===examId.value) await loadCurrent()}
  async function useSavedAnswer() {attemptStore.useSavedAnswer();if(alive) await loadCurrent()}
  function exitAttempt() {
    router.push('/master-exams')
  }

  async function onSelectAnswer(answer) {
    if (answerSubmitting.value) return
    const id=examId.value;const result=await attemptStore.submitAnswer(answer, currentConfidence.value)
    if(result && alive && id===examId.value) await loadCurrent()
  }

  async function onConfidenceChange(confidence) {
    currentConfidence.value = confidence
    const raw = attemptStore.answers[String(attemptStore.currentQuestionId)]
    if (raw?.answer && !answerSubmitting.value) {
      const id=examId.value;const result=await attemptStore.submitAnswer(raw.answer, currentConfidence.value)
      if(result && alive && id===examId.value) await loadCurrent()
    }
  }

  async function gotoQuestion(questionId) {
    const id=examId.value;const result=await attemptStore.goto(questionId)
    if(result && alive && id===examId.value) await loadCurrent()
  }

  async function gotoIndex(index) {
    const questionId = attemptStore.questionIds[index]
    if (questionId !== undefined) await gotoQuestion(questionId)
  }

  async function gotoPrevious() {
    if (currentIndex.value <= 0) return
    await gotoQuestion(attemptStore.questionIds[currentIndex.value - 1])
  }

  async function gotoNext() {
    if (currentIndex.value >= attemptStore.questionIds.length - 1) return
    await gotoQuestion(attemptStore.questionIds[currentIndex.value + 1])
  }

  function hasAnswerAtIndex(index) {
    const questionId = attemptStore.questionIds[index]
    return Boolean(attemptStore.answers[String(questionId)]?.answer)
  }

  async function handleFlag() {
    const reason = await promptDialog(t('questions.flagReason'), '')
    if (reason !== null) await attemptStore.flagCurrentQuestion(reason)
  }

  async function attemptFinish() {
    if (finishing.value) return
    finishing.value = true
    try {
      if (!attemptStore.isPreview) {
        const unanswered = attemptStore.totalQuestions - attemptStore.answeredCount
        if (unanswered > 0) {
          const ok = await confirm(t('masterExams.runnerUnansweredWarning', { count: unanswered }))
          if (!ok) return
        }
      }
      const result = await attemptStore.finish()
      if (result) navigateAfterFinish()
    } finally {
      finishing.value = false
    }
  }

  function navigateAfterFinish() {
    if(!alive || attemptStore.examId!==examId.value) return
    const suffix = attemptStore.isPreview ? 'edit' : 'result'
    router.push(`/master-exams/${examId.value}/${suffix}`)
  }

  watch(
    () => attemptStore.isComplete,
    (complete) => {
      if (complete) navigateAfterFinish()
    },
  )

  useAutoRefresh(
    async (context) => {
      if (attemptStore.isAnswerLoading || attemptStore.isLoading || finishing.value) return {skipped:true}
      if (!attemptStore.examId || !attemptStore.sessionId || attemptStore.isPreview || attemptStore.isComplete) return { skipped: true }
      const result=await attemptStore.pollStatus(context)
      if(result && context.isCurrent() && alive && !attemptStore.pendingAnswer && !attemptStore.isComplete) await loadCurrent()
      return result
    },
    30_000,
    false,
  )

  watch(graceMs, (milliseconds) => {
    if (
      milliseconds !== null &&
      milliseconds <= 0 &&
      !attemptStore.isComplete &&
      !attemptStore.isPreview
    ) {
      attemptFinish()
    }
  })

  async function initialize() {
    const id=examId.value

    if (attemptStore.examId === id && attemptStore.sessionId) {
      showPreStart.value = false
      await loadCurrent()
      return
    }

    attemptStore.reset()
    const exam = await masterExamStore.fetchOne(id)
    if (exam && alive && id===examId.value) {
      attemptStore.hydrateFromExam(exam, { graceSeconds: 180 })
      if (!isPreview.value) await masterExamStore.acknowledge(id)
    }
  }
  onMounted(()=>{timerInterval=setInterval(()=>{nowTick.value=Date.now()},1000);initialize()})
  watch([examId,isPreview],()=>{if(preCountdownTimer) clearInterval(preCountdownTimer);preCountdownTimer=null;showPreStart.value=true;initialize()})
  onBeforeUnmount(() => {
    alive=false
    if (timerInterval) clearInterval(timerInterval)
    if (preCountdownTimer) clearInterval(preCountdownTimer)
  })

  return {reviewAnswer,keepAnswerDraft,useSavedAnswer,
    t,
    attemptStore,
    showPreStart,
    preCountdownActive,
    preCountdownValue,
    currentIndex,
    answerSubmitting,
    currentSavedAnswer,
    currentConfidence,
    timerDisplay,
    timerStatus,
    timerAnnouncement,
    graceDisplay,
    timerClass,
    beginCountdown,
    cancelCountdown,
    exitAttempt,
    onSelectAnswer,
    onConfidenceChange,
    gotoIndex,
    gotoPrevious,
    gotoNext,
    hasAnswerAtIndex,
    handleFlag,
    attemptFinish,
  }
}
