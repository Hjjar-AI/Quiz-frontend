// frontend/src/stores/masterExamAttemptStore.js
import { defineStore } from 'pinia'
import { masterExamService } from '@/services/masterExamService'
import { useCrudActions } from '@/composables/useCrudActions'
import { useNotify } from '@/composables/useNotify'
import { i18n } from '@/i18n'
import { normalizeConfidenceScore } from '@/utils/confidence'
import {
  standardState,
  standardGetters,
  subResourceState,
  subResourceGetters,
  makeReset,
} from '@/stores/storeHelpers'


// The code travels in TWO places on the wire:
//
//   1. `details.code` — the structured, locale-independent signal.
//      This is the primary contract (see
//      MasterExamSubmitAnswerView._attempt_error_details in the
//      backend). It survives i18n of the human-readable message.
//
//   2. The raw `message` string — kept as a fallback for any older
//      backend that still surfaces the code verbatim. The current
//      backend does NOT rely on this path, but the fallback is
//      retained so a mixed-version deploy cannot silently lose
//      the recovery.
export const TIME_EXPIRED_CODE = 'TIME_EXPIRED'

function isTimeExpiredError(err) {
  if (!err) return false
  // Primary signal: structured code carried in `details.code` by
  // MasterExamSubmitAnswerView. Preferred because it survives i18n
  // of the human-readable message — the previous implementation
  // only looked at the message string, which _map_attempt_error
  // had already replaced with Arabic text.
  if (err.details && err.details.code === TIME_EXPIRED_CODE) return true
  // Fallback for any backend that still surfaces the code in the
  // message string.
  const msg = typeof err.message === 'string' ? err.message : ''
  return msg.includes(TIME_EXPIRED_CODE)
}

// ──────────────────────────────────────────────────────────────────
// In-flight answer map, keyed on question id.
//
// `submitAnswer` performs an optimistic write into `this.answers`
// before awaiting the server, and reverts to the captured `previous`
// value on failure. Two rapid calls for the same question — a
// double-click on a radio, or a rapid keyboard `1`-`2` on the same
// question before the first round trip resolves — used to corrupt
// the revert path in exactly the same way `questionStore.toggleVerify`
// did:
//
//   • Call 1 captures previous = the true pre-answer value.
//   • Call 2 captures previous = call 1's optimistic value.
//   • Both requests land. The server processes them in arrival order;
//     its final state is call 2's answer. If call 1's failure
//     handler runs after call 2's success, the revert writes call 1's
//     captured (pre-answer) value and the local state disagrees with
//     the server until the next poll.
//
// The map below keys on question id. The second call returns the
// first call's promise unchanged, so exactly one request fires per
// question per in-flight window and the revert path only ever sees
// the true pre-answer value.
//
// KEYED ON QUESTION ID (not on current question): the runner
// advances `currentQuestionId` inside the success handler, so a
// value-only guard would have been insufficient — the user can
// double-click, advance, come back, and click again while the first
// request is still on the wire.
const _pendingAnswers = new Map()

export const useMasterExamAttemptStore = defineStore('masterExamAttempt', {
  state: () => standardState({contextEpoch:0,progressEpoch:0,navigationBaseline:null,pendingAnswer:null,needsReview:false,reviewed:false,latestStatus:null,
    examId: null,
    examName: '',
    examInstructions: '',
    durationMinutes: 0,
    graceSeconds: 180,

    sessionId: null,
    attemptId: null,
    isPreview: false,
    isMakeup: false,

    questionIds: [],
    currentQuestionId: null,
    currentQuestion: null,

    answers: {},

    previewQuestions: {},
    previewFeedback: null,

    serverOffsetMs: 0,
    startedAt: null,
    deadlineAt: null,
    finishedAt: null,

    result: null,
    previewFinished: false,

    ...subResourceState('answer'),
    ...subResourceState('poll'),
  }),

  getters: {
    ...standardGetters,
    ...subResourceGetters('answer'),
    ...subResourceGetters('poll'),

    totalQuestions: (state) => state.questionIds.length,
    answeredCount: (state) => Object.keys(state.answers).length,
    isComplete: (state) => !!state.finishedAt,

    remainingMs: (state) => {
      if (!state.deadlineAt) return null
      const serverNow = Date.now() + state.serverOffsetMs
      return Math.max(0, new Date(state.deadlineAt).getTime() - serverNow)
    },

    isExpired: (state) => {
      if (!state.deadlineAt) return false
      const serverNow = Date.now() + state.serverOffsetMs
      return serverNow >= new Date(state.deadlineAt).getTime()
    },

    inGraceWindow: (state) => {
      if (!state.deadlineAt) return false
      const serverNow = Date.now() + state.serverOffsetMs
      const deadlineMs = new Date(state.deadlineAt).getTime()
      const graceMs = (state.graceSeconds || 180) * 1000
      return serverNow >= deadlineMs && serverNow < deadlineMs + graceMs
    },

    currentIndex: (state) => {
      return state.questionIds.indexOf(state.currentQuestionId)
    },
  },

  actions: {

    async start(examId, { preview = false } = {}) {
      this.reset()

      const { wrap } = useCrudActions(this)
      return await wrap(
        () => masterExamService.startAttempt(examId, { preview }),
        {
          successMsg: null,
          errorMsgFallbackKey: 'masterExams.startFailed',
          onSuccess: (res) => {
            this.examId = examId
            this.sessionId = res.session_id
            this.attemptId = res.id || null
            this.isPreview = !!res.is_preview
            this.isMakeup = !!res.is_makeup
            this.examName = res.exam_name || ''
            this.questionIds = res.question_ids || []
            this.answers = res.answers || {}
            this.finishedAt=res.is_complete ? new Date(res.finished_at || Date.now()) : null
            this.currentQuestionId = res.current_question_id || (this.questionIds[0] ?? null)
            this.navigationBaseline=res.current_question_id ?? null
            this.durationMinutes = res.duration_minutes || 0
            this.graceSeconds = res.grace_seconds || 180

            if (this.isPreview && Array.isArray(res.questions)) {
              const map = {}
              for (const q of res.questions) {
                map[q.id] = q
              }
              this.previewQuestions = map
            }

            if (res.started_at) {
              this.startedAt = new Date(res.started_at)
            }
            if (res.deadline_at) {
              this.deadlineAt = new Date(res.deadline_at)
            } else {
              this.deadlineAt = null
            }

            if (!this.isPreview && this.deadlineAt) {
              this._syncServerOffset()
            }
          },
        },
      )
    },

    // ── hydrateFromExam ─────────────────────────────────────────────
    //
    // Direct writes bypassed the action layer that every other store
    // in the app follows (compare `_applySessionState` and the
    // `onSuccess` blocks above). This action restores the convention
    // and makes the hydration testable in isolation.
    //
    // GUARD FIDELITY. The two `|| ...` guards on `examInstructions`
    // and `questionIds` are kept because the ORIGINAL CALLER had them
    // inline — they are part of the caller's contract, not the
    // store's. No guards are added on `examName` or `durationMinutes`
    // because the original caller assigned those verbatim, and a
    // future reader comparing the two should see the same surface.
    //
    // `graceSeconds` is parameterized because the runner supplies it
    // explicitly (as a literal `180` today), which keeps the default
    // here identical to what the caller used to write.
    hydrateFromExam(exam, { graceSeconds = 180 } = {}) {
      if (!exam) return
      this.examName = exam.name
      this.examInstructions = exam.instructions || ''
      this.durationMinutes = exam.duration_minutes
      this.questionIds = exam.question_ids || []
      this.graceSeconds = graceSeconds
    },

    async _syncServerOffset() {
      try {
        const status = await masterExamService.attemptStatus(this.examId,{signal})
        if (status.server_now) {
          const serverNow = new Date(status.server_now).getTime()
          this.serverOffsetMs = serverNow - Date.now()
        }
      } catch {
      }
    },

    async fetchCurrentQuestion() {
      if (this.isPreview) {
        const qid = this.currentQuestionId
        const q = this.previewQuestions[qid]
        if (!q) {
          this.currentQuestion = null
          return null
        }
        this.currentQuestion = {
          id: q.id,
          text: q.text,
          choices: q.choices,
          image_url: q.image_url,
          case: q.case || null,
        }
        this.previewFeedback = null
        return { question: this.currentQuestion }
      }

      const { wrap } = useCrudActions(this)
      const progress=this.progressEpoch,session=this.sessionId
      return await wrap(() => masterExamService.attemptQuestion(this.examId), {
        isCurrent:()=>progress===this.progressEpoch && session===this.sessionId && !this.pendingAnswer,
        suppressErrorToast: true,
        onSuccess: (payload) => {
          this.currentQuestion = payload.question
          this.currentQuestionId = payload.question.id
          this.navigationBaseline=Object.prototype.hasOwnProperty.call(payload,'current_question_id') ? payload.current_question_id : payload.question.id

          if (payload.saved_answer != null) {
            this.answers = {
              ...this.answers,
              [String(payload.question.id)]: payload.saved_slot || this.answers[String(payload.question.id)] || {answer:payload.saved_answer,confidence:normalizeConfidenceScore(payload.saved_confidence)},
            }
          }
        },
      })
    },

    // ── submitAnswer (with in-flight dedup) ────────────────────────
    //
    // A second call for the same question while the first is still
    // pending returns the first call's promise. See the module-level
    // comment on `_pendingAnswers` for the failure mode this
    // prevents.
    async submitAnswer(answer,confidence=3) {
      if(!this.currentQuestionId || this.needsReview || this.isAnswerLoading || this.isLoading || this.isComplete) return null
      const qid=this.currentQuestionId
      const key=`${this.contextEpoch}:${this.sessionId}:${qid}`
      if(_pendingAnswers.has(key)) return _pendingAnswers.get(key)
      const promise=this._executeSubmitAnswer(qid,answer,confidence)
      _pendingAnswers.set(key,promise)
      try {return await promise} finally {if(_pendingAnswers.get(key)===promise) _pendingAnswers.delete(key)}
    },
    async _executeSubmitAnswer(questionId,answer,confidence) {
      confidence=normalizeConfidenceScore(confidence)
      if(this.isPreview) {
        this.answers={...this.answers,[String(questionId)]:{answer,confidence}}
        const q=this.previewQuestions[questionId]
        if(q) this.previewFeedback={isCorrect:answer===q.correct_answer,correctAnswer:q.correct_answer,explanation:q.explanation||'',selectedAnswer:answer}
        return {success:true,current_question_id:questionId}
      }
      const intent={questionId,answer,confidence,expectedSlot:this.answers[String(questionId)] || null,sessionId:this.sessionId}
      return this._sendAnswer(intent)
    },
    async _sendAnswer(intent) {
      this.pendingAnswer=intent;this.reviewed=false
      return useCrudActions(this,{statusKey:'answerStatus',errorKey:'answerError'}).wrap(
        ()=>masterExamService.submitAnswer(this.examId,intent),{
          successMsg:null,errorMsgFallbackKey:'masterExams.saveAnswerFailed',
          onSuccess:res=>{this.progressEpoch++;this.navigationBaseline=res.current_question_id;this.answers={...this.answers,[String(intent.questionId)]:res.saved_slot};this.currentQuestionId=res.current_question_id;this.pendingAnswer=null;this.needsReview=false;this.reviewed=false},
          onError:error=>{
            const rejected=[400,401,403,404,409,422,429].includes(Number(error.code))
            this.needsReview=!rejected || Number(error.code)===409
            if(!this.needsReview) this.pendingAnswer=null
            if(isTimeExpiredError(error)) this.finishedAt=new Date()
          },
        })
    },
    async reviewPending() {return this.pollStatus({review:true})},
    async retryPending() {
      if(!this.needsReview || !this.reviewed || !this.pendingAnswer || this.isAnswerLoading || this.isComplete || this.latestStatus?.session_id!==this.pendingAnswer.sessionId) return null
      const intent={...this.pendingAnswer,expectedSlot:this.answers[String(this.pendingAnswer.questionId)] || null}
      this.needsReview=false
      return this._sendAnswer(intent)
    },
    useSavedAnswer() {
      if(!this.reviewed || this.isAnswerLoading) return
      this.pendingAnswer=null;this.needsReview=false;this.reviewed=false
      if(this.latestStatus) this.currentQuestionId=this.latestStatus.current_question_id
    },

    async goto(questionId) {
      if(this.needsReview || this.isAnswerLoading || this.isLoading || this.isComplete) return null
      if (this.isPreview) {
        if (!this.questionIds.includes(questionId)) {
          return null
        }
        this.currentQuestionId = questionId
        this.previewFeedback = null
        return { current_question_id: questionId }
      }

      const { wrap } = useCrudActions(this)
      return await wrap(
        () => masterExamService.gotoQuestion(this.examId, questionId,this.sessionId,this.navigationBaseline),
        {
          successMsg: null,
          errorMsgFallbackKey: 'masterExams.navigateFailed',
          onError:error=>{if(![400,401,403,404,422,429].includes(Number(error.code))) {this.needsReview=true;this.reviewed=false}},
          onSuccess: (res) => {
            if (res && res.current_question_id !== undefined) {
              this.progressEpoch++;this.navigationBaseline=res.current_question_id
              this.currentQuestionId = res.current_question_id
            }
          },
        },
      )
    },

    async flagCurrentQuestion(reason = '') {
      if (!this.currentQuestionId) return null

      if (this.isPreview) {
        const { notify } = useNotify()
        notify(i18n.global.t('masterExams.runnerPreviewFlagNoop'), 'info')
        return { success: false, preview: true }
      }

      const { wrap } = useCrudActions(this)
      return await wrap(
        () => masterExamService.flagQuestion(this.examId, {
          questionId: this.currentQuestionId,
          reason,
        }),
        {
          successMsgKey: 'notifications.masterExamFlagged',
          errorMsgFallbackKey: 'masterExams.flagFailed',
        },
      )
    },

    async finish() {
      if(this.needsReview || this.isAnswerLoading || this.isLoading) return null
      if (this.isPreview) {
        this.previewFinished = true
        this.finishedAt = new Date()
        return { preview: true }
      }

      const { wrap } = useCrudActions(this)
      return await wrap(() => masterExamService.finishAttempt(this.examId), {
        successMsg: null,
        errorMsgFallbackKey: 'masterExams.runnerFinishFailed',
        onSuccess: (attempt) => {
          this.result = attempt
          this.finishedAt = new Date()
        },
      })
    },

    async pollStatus({signal,review=false,isCurrent} = {}) {
      if (!this.examId || this.isPreview) return null
      const { wrap } = useCrudActions(this, {
        statusKey: 'pollStatus',
        errorKey: 'pollError',
      })
      const progress=this.progressEpoch
      return await wrap(() => masterExamService.attemptStatus(this.examId,{signal}), {
        isCurrent:()=>progress===this.progressEpoch && (isCurrent?.() ?? true),
        suppressErrorToast: true,
        onSuccess: (status) => {
          if (!status || (this.sessionId && status.session_id!==this.sessionId)) return
          this.navigationBaseline=status.current_question_id
          this.latestStatus=status
          this.answers=status.answers || {}
          this.attemptId=status.attempt_id;this.sessionId=status.session_id
          this.startedAt=status.started_at ? new Date(status.started_at) : this.startedAt
          this.deadlineAt=status.deadline_at ? new Date(status.deadline_at) : null
          this.durationMinutes=status.duration_minutes || this.durationMinutes;this.graceSeconds=status.grace_seconds ?? this.graceSeconds
          if(review) this.reviewed=true
          const intent=this.pendingAnswer
          const saved=intent ? this.answers[String(intent.questionId)] : null
          if(intent && intent.sessionId===status.session_id && saved?.answer===intent.answer && normalizeConfidenceScore(saved.confidence)===intent.confidence) {this.pendingAnswer=null;this.needsReview=false;this.reviewed=false}

          if (Array.isArray(status.question_ids)) {
            this.questionIds = status.question_ids
          }

          if (status.server_now) {
            const serverNow = new Date(status.server_now).getTime()
            this.serverOffsetMs = serverNow - Date.now()
          }

          if (status.is_complete && !this.finishedAt) {
            this.finishedAt = new Date()
          }

          if (!this.pendingAnswer && status.current_question_id !== undefined) {
            this.currentQuestionId = status.current_question_id
          }
        },
      })
    },

    reset() {
      _pendingAnswers.clear()
      return makeReset({contextEpoch:this.contextEpoch+1,progressEpoch:0,navigationBaseline:null,pendingAnswer:null,needsReview:false,reviewed:false,latestStatus:null,
      examId: null,
      examName: '',
      examInstructions: '',
      durationMinutes: 0,
      graceSeconds: 180,
      sessionId: null,
      attemptId: null,
      isPreview: false,
      isMakeup: false,
      questionIds: [],
      currentQuestionId: null,
      currentQuestion: null,
      answers: {},
      previewQuestions: {},
      previewFeedback: null,
      serverOffsetMs: 0,
      startedAt: null,
      deadlineAt: null,
      finishedAt: null,
      result: null,
      previewFinished: false,
      answerStatus: 'idle',
      answerError: null,
      pollStatus: 'idle',
      pollError: null,
      status: 'idle',
      error: null,
    }).call(this)
    },
  },
})
