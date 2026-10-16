// frontend/src/stores/testSessionStore.js
import { defineStore } from 'pinia'
import { createTestService } from '@/services/testServiceFactory'
import { useCrudActions } from '@/composables/useCrudActions'
import { useDialog } from '@/composables/useDialog'
import { useConfigStore } from '@/stores/configStore'
import { i18n } from '@/i18n'
import { FALLBACK_MAX_CHOICES } from '@/utils/constants'
import { normalizeConfidenceScore } from '@/utils/confidence'
import { sessionGeneration, sessionCancelled } from '@/services/api/sessionScope'
import {
  standardState,
  standardGetters,
  subResourceState,
  subResourceGetters,
} from '@/stores/storeHelpers'

const SESSION_MODE_KEY = 'test_session_mode'
const SESSION_ID_KEY = 'test_session_id'
const VALID_MODES = ['exam', 'study', 'recall']

// ──────────────────────────────────────────────────────────────────
// Safe sessionStorage wrappers.
//
// `sessionStorage` throws on access in several environments this app
// is expected to run in — Safari private mode, embedded webviews
// with site-data disabled, browsers configured to block storage for
// the origin. The previous direct accesses crashed the store on
// boot in any of those cases: `hydrateFromSession` is called from
// `main.js` before the app mounts, so a throwing `getItem` produced
// a blank screen with no diagnostic.
//
// These wrappers match `storageService`'s contract for the
// localStorage side (see services/storageService.js) — the two
// storage layers now fail the same way. A caller that reaches one
// of these in a storage-blocked environment gets `null` from the
// read path and a silent no-op from the write path; the session
// simply does not survive a reload, which is the correct degraded
// behaviour.
function safeSessionGet(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Session state not persistable — the in-memory store still
    // carries the session for the current tab until navigation.
  }
}

function safeSessionRemove(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Nothing to clean up if storage was never usable.
  }
}

function getService(mode) {
  return createTestService(mode)
}

export const useTestSessionStore = defineStore('testSession', {
  state: () => standardState({
    mode: null,
    sessionId: null,
    questionIds: [],
    currentIndex: 0,
    answers: {},
    confidence: {},
    tag: '',
    startedAt: null,
    accumulatedTime: 0,
    isActive: false,
    results: null,
    durationMinutes: null,
    blueprintId: null,
    requestEpoch: 0,
    currentPage: null,
    answerBaseline: null,
    pendingSubmission: null,
    submissionRecoveryRequired: false,
    submissionReview: null,
    ...subResourceState('submit'),
  }),
  getters: {
    ...standardGetters,
    ...subResourceGetters('submit'),
    totalQuestions: (state) => state.questionIds.length,
    isComplete: (state) => state.results !== null,
    answeredCount: (state) => Object.keys(state.answers).length,
    progress: (state) => {
      return state.totalQuestions > 0
        ? (state.answeredCount / state.totalQuestions) * 100
        : 0
    },
    currentQuestionId: (state) => state.questionIds[state.currentIndex] || null,
    currentConfidence: (state) => {
      const idx = state.currentIndex
      return normalizeConfidenceScore(state.confidence[idx])
    },
  },
  actions: {
    reset() {
      this._clearMemory()
      safeSessionRemove(SESSION_MODE_KEY)
      safeSessionRemove(SESSION_ID_KEY)
    },
    _clearMemory() {
      this.requestEpoch += 1
      this.sessionId = null
      this.mode = null
      this.questionIds = []
      this.currentIndex = 0
      this.answers = {}
      this.confidence = {}
      this.tag = ''
      this.startedAt = null
      this.accumulatedTime = 0
      this.isActive = false
      this.results = null
      this.durationMinutes = null
      this.blueprintId = null
      this.status = 'idle'
      this.error = null
      this.submitStatus = 'idle'
      this.submitError = null
      this.currentPage = null
      this.answerBaseline = null
      this.pendingSubmission = null
      this.submissionRecoveryRequired = false
      this.submissionReview = null
    },
    hydrateFromSession() {
      const savedMode = safeSessionGet(SESSION_MODE_KEY)
      const savedSessionId = safeSessionGet(SESSION_ID_KEY)
      if (!savedMode || !savedSessionId || !savedSessionId.trim()) return false
      if (!VALID_MODES.includes(savedMode)) return false
      if (this.mode && this.sessionId) return true
      this.mode = savedMode
      this.sessionId = savedSessionId
      return true
    },
    prepareForMode(mode) {
      if (this.mode !== mode) {
        this._clearMemory()
        this.mode = mode
      }
    },

    // ── start ────────────────────────────────────────────────────────
    //
    // Unified entry point for both exam and study.
    //
    // The backend accepts the full superset of selection parameters
    // for either mode; the only mode-sensitive behavior is downstream
    // (timer overtime, per-question explanations, reflection prompt),
    // all of which the backend decides from the `mode` path segment.
    //
    // REQUEST SHAPE
    // -------------
    //   • `tag`             — the tag FILTER value. Sent only when the
    //                         caller's source is a tag. The backend's
    //                         filter-builder reads this key.
    //   • `session_label`   — the display label persisted to
    //                         StudySession.tag and TestHistory.tag.
    //                         Sent for every source. Backend prefers
    //                         this over `tag` (see StartSessionView).
    //   • `category_ids`    — array of category ids (multi-select).
    //   • `use_bookmarks`   — restrict to the caller's bookmarks.
    //   • `use_srs`         — restrict to SRS-due questions.
    //   • `blueprint_id`    — weighted sampling by blueprint.
    //   • `difficulty`, `tags_filter`, `verified_only` — refinements.
    //   • `limit`           — cap on question count.
    //   • `disable_timer`   — client-side only. Not sent to the
    //                         backend. When true, forces the runner
    //                         into stopwatch mode by leaving
    //                         `durationMinutes` null even though the
    //                         backend returns a countdown value.
    //
    // MODE COMMIT SEMANTICS
    // ---------------------
    // `this.mode` is set inside `onSuccess`, not before the request.
    // A failed start leaves the store's previous mode untouched, so
    // the caller's sessionStorage and the store stay coherent.
    async start(mode, config) {
      if (this.pendingSubmission || this.submissionRecoveryRequired) return null
      this.requestEpoch += 1
      const { wrap } = useCrudActions(this)
      const service = getService(mode)

      const requestPayload = {}
      if (config.tag) requestPayload.tag = config.tag
      if (config.session_label) requestPayload.session_label = config.session_label
      if (config.question_ids && config.question_ids.length) {
        requestPayload.question_ids = config.question_ids
      }
      if (config.blueprint_id) requestPayload.blueprint_id = config.blueprint_id
      if (config.use_srs) requestPayload.use_srs = true
      if (config.use_bookmarks) requestPayload.use_bookmarks = true
      if (config.category_ids && config.category_ids.length) {
        requestPayload.category_ids = config.category_ids
      }
      if (config.source_document) requestPayload.source_document = config.source_document
      if (config.difficulty) requestPayload.difficulty = config.difficulty
      if (config.tags_filter) requestPayload.tags_filter = config.tags_filter
      if (config.verified_only) requestPayload.verified_only = true
      requestPayload.limit = config.limit || 200

      const sessionLabel = config.session_label
        || config.tag
        || i18n.global.t('tests.genericTag')

      return await wrap(() => service.start(requestPayload), {
        successMsg: null,
        errorMsgFallbackKey: 'notifications.sessionStartFailed',
        onSuccess: (res) => {
          if (!res.session_id) {
            throw new Error(i18n.global.t('tests.backendError'))
          }

          // Commit mode only on success.
          this.mode = mode
          this.sessionId = res.session_id
          this.questionIds = res.question_ids || []

          this.tag = res.tag ?? sessionLabel
          this.currentIndex = 0
          this.answers = {}
          this.confidence = {}
          this.currentPage = null
          this.answerBaseline = null
          this.pendingSubmission = null
          this.submissionRecoveryRequired = false
          this.submissionReview = null
          const parsedStart = res.started_at ? new Date(res.started_at) : new Date()
          this.startedAt = isNaN(parsedStart.getTime()) ? new Date() : parsedStart
          this.accumulatedTime = 0
          this.isActive = true
          this.results = null
          this.blueprintId = res.blueprint || null

          // Timer decision:
          //   • config.disable_timer → force stopwatch (elapsed only).
          //   • res.duration_minutes  → countdown (backend supplied).
          //   • otherwise             → elapsed only.
          if (config.disable_timer && mode !== 'exam') {
            this.durationMinutes = null
          } else if (res.duration_minutes) {
            this.durationMinutes = Number(res.duration_minutes)
          } else {
            this.durationMinutes = null
          }

          safeSessionSet(SESSION_MODE_KEY, mode)
          safeSessionSet(SESSION_ID_KEY, res.session_id)
        },
      })
    },

    // ── startSRS ─────────────────────────────────────────────────────
    //
    // Thin wrapper for the legacy quick-action entry points
    // (Dashboard's SRS card). Delegates to start() with the SRS source
    // preset, mode forced to 'study', and the timer disabled so the
    // session reads as a relaxed review rather than a timed exam.
    //
    // Callers that construct an SRS session through UnifiedTestSetup
    // do NOT go through this method — they hit start() directly and
    // let the user's mode choice decide the timer behavior.
    async startSRS(limit = 20) {
      return this.start('study', {
        use_srs: true,
        limit,
        session_label: i18n.global.t('tests.smartReviewTag'),
        disable_timer: true,
      })
    },

    _applyQuestionPage(page) {
      this.currentIndex = page.index
      this.currentPage = page
      this.answerBaseline = {
        answer: page.saved_answer ?? null,
        confidence: page.saved_confidence ?? null,
        pre_answer: page.saved_pre_answer || null,
        error_reason: page.saved_error_reason || null,
      }
      const answers = { ...this.answers }
      const confidence = { ...this.confidence }
      if (page.saved_answer == null) delete answers[page.index]
      else answers[page.index] = page.saved_answer
      if (page.saved_confidence == null) delete confidence[page.index]
      else confidence[page.index] = normalizeConfidenceScore(page.saved_confidence)
      this.answers = answers
      this.confidence = confidence
    },

    async fetchQuestion() {
      if (!this.isActive || this.pendingSubmission || this.submissionRecoveryRequired || this.currentIndex < 0 || this.currentIndex >= this.totalQuestions) return null
      const owner = this.sessionId
      const mode = this.mode
      const generation = sessionGeneration()
      const epoch = ++this.requestEpoch
      const { wrap } = useCrudActions(this)
      return await wrap(() => getService(mode).getQuestion(owner), {
        isCurrent: () => this.sessionId === owner && this.mode === mode && this.requestEpoch === epoch && !this.pendingSubmission && !this.submissionRecoveryRequired,
        successMsg: null,
        errorMsgFallbackKey: 'notifications.questionLoadFailed',
        onSuccess: (page) => {
          if (this.sessionId === owner && this.mode === mode && sessionGeneration() === generation && !this.submissionRecoveryRequired) this._applyQuestionPage(page)
        },
      })
    },

    async submitAnswer(answer, action = 'next', targetIndex = null, confidence = null, errorReason = null, preAnswer = null) {
      if (this.pendingSubmission || this.submissionRecoveryRequired || !this.isActive || !this.answerBaseline || this.currentPage?.index !== this.currentIndex) {
        throw new Error(i18n.global.t('tests.reviewProgressRequired'))
      }
      if (answer != null) {
        const configStore = useConfigStore()
        const maxChoices = configStore.maxChoices || FALLBACK_MAX_CHOICES
        if (!Number.isInteger(answer) || answer < 1 || answer > maxChoices) {
          const error = new Error(i18n.global.t('tests.invalidAnswer', { max: maxChoices }))
          error.code = 400
          throw error
        }
      }
      const owner = this.sessionId
      const mode = this.mode
      const generation = sessionGeneration()
      const requestIndex = this.currentIndex
      this.requestEpoch += 1
      const draft = {
        sessionId: owner, mode, index: requestIndex,
        question: this.currentPage.question,
        answer, action, targetIndex, confidence, errorReason, preAnswer,
        baseline: { ...this.answerBaseline },
      }
      this.pendingSubmission = draft
      this.submissionReview = null
      this.submitStatus = 'loading'
      this.submitError = null
      try {
        const response = await getService(mode).submitAnswer(owner, answer, action, targetIndex, confidence, errorReason, preAnswer, requestIndex, draft.baseline)
        if (this.sessionId !== owner || this.mode !== mode || sessionGeneration() !== generation) throw sessionCancelled()
        // Matching backend returns the acknowledged slot, including normalized confidence/reflection.
        if (response.saved_slot) {
          const slot = response.saved_slot
          this._applyQuestionPage({ ...this.currentPage,
            saved_answer: slot.answer, saved_confidence: slot.confidence,
            saved_pre_answer: slot.pre_answer, saved_error_reason: slot.error_reason,
            saved_is_correct: response.is_correct,
          })
        } else {
          this.answerBaseline = null
        }
        this.currentIndex = response.new_index ?? requestIndex
        if (this.currentIndex !== requestIndex) {
          this.currentPage = null
          this.answerBaseline = null
        }
        this.pendingSubmission = null
        this.submitStatus = 'success'
        return response
      } catch (error) {
        if (this.sessionId !== owner || this.mode !== mode || sessionGeneration() !== generation) throw sessionCancelled()
        this.submitStatus = 'error'
        this.submitError = error?.message || i18n.global.t('tests.answerSaveFailed')
        if (error?.details?.code === 'TIME_EXPIRED') this.pendingSubmission = null
        else this.submissionRecoveryRequired = true
        const outgoing = new Error(this.submitError)
        outgoing.code = error?.code
        outgoing.details = error?.details
        throw outgoing
      }
    },

    async readSubmissionState() {
      const draft = this.pendingSubmission
      if (!draft || !this.submissionRecoveryRequired || this.submitStatus === 'loading') return null
      const generation = sessionGeneration()
      const owns = () => this.pendingSubmission === draft && this.sessionId === draft.sessionId && this.mode === draft.mode && sessionGeneration() === generation
      this.submitStatus = 'loading'
      this.submissionReview = null
      try {
        const service = getService(draft.mode)
        const status = await service.status(draft.sessionId)
        if (!owns()) return null
        // This endpoint represents a missing session with 200 and no session_id.
        if (!status?.session_id) {
          try {
            const result = await service.completedResult(draft.sessionId)
            if (owns()) this.submissionReview = { result }
          } catch (error) {
            if (error?.code !== 404) throw error
            if (owns()) this.submissionReview = { missing: true }
          }
          return owns() ? this.submissionReview : null
        }
        if (status.session_id !== draft.sessionId) throw new Error(i18n.global.t('tests.reviewProgressRequired'))
        let page = null
        if (status.is_active && status.current_index >= 0 && status.current_index < status.question_ids.length) {
          try {
            page = await service.getQuestion(draft.sessionId)
          } catch (error) {
            if (error?.code !== 404 && error?.details?.code !== 'ANSWERS_WITHHELD') throw error
          }
          if (!owns()) return null
          if (page && (page.index !== status.current_index || page.question.id !== status.question_ids[page.index])) throw new Error(i18n.global.t('tests.reviewProgressRequired'))
        }
        this.submissionReview = { status, page }
        return this.submissionReview
      } catch (error) {
        if (owns()) this.submitError = error?.message || i18n.global.t('tests.reviewProgressRequired')
        throw error
      } finally {
        if (owns()) this.submitStatus = 'error'
      }
    },

    acceptSubmissionReview() {
      const review = this.submissionReview
      if (!review || this.submitStatus === 'loading') return null
      this.requestEpoch += 1
      if (review.missing) {
        this.reset()
      } else if (review.result) {
        this.results = review.result
        this.isActive = false
        this.sessionId = null
        safeSessionRemove(SESSION_MODE_KEY)
        safeSessionRemove(SESSION_ID_KEY)
      } else {
        const retainedDuration = this.durationMinutes
        this._applySessionState(review.status, Boolean(review.status.is_active))
        this.durationMinutes = retainedDuration
        if (review.page) this._applyQuestionPage(review.page)
      }
      this.pendingSubmission = null
      this.submissionReview = null
      this.submissionRecoveryRequired = false
      this.submitStatus = 'success'
      this.submitError = null
      return review
    },

    async finish({ forced = false } = {}) {
      if (this.pendingSubmission || this.submissionRecoveryRequired) return null
      if (!this.isActive) return null
      if (!forced) {
        const { confirm } = useDialog()
        const unanswered = this.totalQuestions - this.answeredCount
        if (unanswered > 0) {
          const ok = await confirm(
            i18n.global.t('tests.unansweredWarning', { count: unanswered })
          )
          if (!ok) return null
        }
      }
      const { wrap } = useCrudActions(this)
      const service = getService(this.mode)
      return await wrap(() => service.finish(this.sessionId), {
        successMsg: null,
        errorMsgFallbackKey: 'notifications.resultsFetchFailed',
        onSuccess: (results) => {
          this.results = results
          this.isActive = false
          this.sessionId = null
          this.questionIds = []
          this.answers = {}
          this.confidence = {}
          this.currentIndex = 0
          this.startedAt = null
          this.accumulatedTime = 0
          safeSessionRemove(SESSION_MODE_KEY)
          safeSessionRemove(SESSION_ID_KEY)
        },
      })
    },

    async pause() {
      if (this.pendingSubmission || this.submissionRecoveryRequired) return null
      if (!this.isActive) return
      const { wrap } = useCrudActions(this)
      const service = getService(this.mode)
      if (!service.pause) return
      return await wrap(() => service.pause(this.sessionId), {
        successMsg: null,
        errorMsgFallbackKey: 'notifications.pauseFailed',
        onSuccess: () => {
          this.isActive = false
        },
      })
    },

    async resume() {
      if (this.pendingSubmission || this.submissionRecoveryRequired) return null
      this.requestEpoch += 1
      if (!this.mode) {
        const savedMode = safeSessionGet(SESSION_MODE_KEY)
        const savedSessionId = safeSessionGet(SESSION_ID_KEY)
        if (savedMode) {
          this.mode = savedMode
          this.sessionId = savedSessionId
        }
      }
      if (!this.mode) return null
      const { wrap } = useCrudActions(this)
      const service = getService(this.mode)
      let res
      if (this.sessionId) {
        res = await wrap(() => service.resume(this.sessionId), {
          errorMsgFallbackKey: 'notifications.resumeFailed',
        })
      } else {
        res = await wrap(() => service.resume(null, this.mode), {
          errorMsgFallbackKey: 'notifications.resumeFailed',
        })
      }
      if (!res || !res.session_id) {
        return null
      }
      this.sessionId = res.session_id
      if (res.question_ids) {
        this._applySessionState(res, true)
      } else {
        const status = await wrap(() => service.status(res.session_id), {
          errorMsgFallbackKey: 'notifications.sessionStatusFailed',
        })
        if (!status) {
          return null
        }
        if (status.is_active) {
          this._applySessionState(status, true)
          this.sessionId = status.session_id
        } else {
          this.reset()
          return res
        }
      }
      safeSessionSet(SESSION_MODE_KEY, this.mode)
      safeSessionSet(SESSION_ID_KEY, this.sessionId)
      return res
    },

    async discardProgress() {
      if (this.pendingSubmission || this.submissionRecoveryRequired) return null
      if (!this.mode) {
        const savedMode = safeSessionGet(SESSION_MODE_KEY)
        if (savedMode) this.mode = savedMode
      }
      if (!this.mode) return
      const { wrap } = useCrudActions(this)
      const service = getService(this.mode)
      return await wrap(() => service.discardProgress(this.sessionId, this.mode), {
        errorMsgFallbackKey: 'notifications.progressDeleteFailed',
        onSuccess: () => this.reset(),
      })
    },

    async restoreFullState() {
      if (this.pendingSubmission || this.submissionRecoveryRequired) return null
      if (!this.mode) {
        const savedMode = safeSessionGet(SESSION_MODE_KEY)
        const savedSessionId = safeSessionGet(SESSION_ID_KEY)
        if (savedMode && savedSessionId) {
          this.mode = savedMode
          this.sessionId = savedSessionId
        }
      }
      if (!this.mode || !this.sessionId) return
      const { wrap } = useCrudActions(this)
      const service = getService(this.mode)
      if (!service.status) return
      const owner = this.sessionId
      const mode = this.mode
      const epoch = ++this.requestEpoch
      return await wrap(() => service.status(owner), {
        isCurrent: () => this.sessionId === owner && this.mode === mode && this.requestEpoch === epoch && !this.pendingSubmission && !this.submissionRecoveryRequired,
        errorMsgFallbackKey: 'notifications.sessionRestoreFailed',
        onSuccess: (status) => {
          if (!status) return
          this._applySessionState(status, Boolean(status.is_active))
          this.sessionId = status.session_id
        },
      })
    },

    _applySessionState(status, isActive = true) {
      this.questionIds = status.question_ids || []
      this.currentIndex = status.current_index ?? 0
      const rawAnswers = status.answers || {}
      const unpackedAnswers = {}
      const unpackedConfidence = {}
      for (const [idxStr, raw] of Object.entries(rawAnswers)) {
        const idx = Number(idxStr)
        if (raw && typeof raw === 'object' && raw.answer !== null && raw.answer !== undefined) {
          unpackedAnswers[idx] = raw.answer
          if (raw.confidence_provided !== false) {
            unpackedConfidence[idx] = normalizeConfidenceScore(raw.confidence)
          }
        } else if (raw !== null && typeof raw !== 'object') {
          unpackedAnswers[idx] = raw
          unpackedConfidence[idx] = 3
        }
      }
      this.answers = unpackedAnswers
      this.confidence = unpackedConfidence
      this.tag = status.tag || ''
      if (status.started_at) {
        const parsedDate = new Date(status.started_at)
        this.startedAt = isNaN(parsedDate.getTime()) ? null : parsedDate
      } else {
        this.startedAt = null
      }
      this.accumulatedTime = status.accumulated_time || 0
      this.isActive = isActive
      this.results = null
      this.currentPage = null
      this.answerBaseline = null
      this.durationMinutes = status.duration_minutes ?? null
    },

    goToQuestion(index) {
      if (Number.isInteger(index) && index >= 0 && index < this.totalQuestions) {
        this.currentIndex = index
      }
    },
    hasAnswer(index) {
      return this.answers[index] !== undefined && this.answers[index] !== null
    },
  },
})
