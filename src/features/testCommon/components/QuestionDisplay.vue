<!-- frontend/src/features/testCommon/components/QuestionDisplay.vue -->
<template>
  <div>
    <CaseStemPanel v-if="displayQuestion.case?.stem || displayQuestion.case?.title" :stem="displayQuestion.case.stem || ''" :title="displayQuestion.case.title || ''" />

    <BaseCard
      class="question-card"
      :class="{ 'question-card--disabled': disabled }"
    >
      <div class="question-display__header">
        <h2 :id="`${groupId}-question`" class="question-display__text">
          <BaseMarkdown :text="displayQuestion.text" />
        </h2>
        <template v-if="showVerification">
          <BaseBadge
            v-if="question.verified"
            variant="success"
            status
            :title="`${t('questions.verified')} — ${question.verified_by || ''}`"
          >
            <i class="bi bi-patch-check-fill" aria-hidden="true"></i> {{ t('questions.verified') }}
          </BaseBadge>
          <BaseBadge v-else variant="warning" status :title="t('questions.unverified')">
            <i class="bi bi-patch-check" aria-hidden="true"></i> {{ t('questions.unverified') }}
          </BaseBadge>
        </template>
      </div>

      <img
        v-if="question.image_url"
        :src="question.image_url"
        :alt="t('tests.questionImageAlt')"
        class="question-image"
        loading="lazy"
      />

      <div
        v-if="answerBeforeOptions && !choicesRevealed"
        class="recall-prompt"
      >
        <label class="recall-prompt__label" for="recall-pre-answer">
          {{ t('tests.recallPrompt') }}
        </label>
        <textarea
          id="recall-pre-answer"
          v-model="preAnswer"
          class="form-control recall-prompt__input"
          rows="3"
          maxlength="1000"
          :disabled="disabled"
          :placeholder="t('tests.recallPlaceholder')"
          @keydown.ctrl.enter.prevent="revealChoices"
        ></textarea>
        <BaseButton
          variant="primary"
          class="btn btn-primary recall-prompt__reveal"
          :disabled="disabled || !preAnswer.trim()"
          @click="revealChoices"
        >
          <i class="bi bi-eye" aria-hidden="true"></i> {{ t('tests.revealOptions') }}
        </BaseButton>
        <small class="text-muted">{{ t('tests.recallPrivacyHint') }}</small>
      </div>

      <div v-if="!answerBeforeOptions || choicesRevealed" class="question-card__choices" role="radiogroup" :aria-labelledby="`${groupId}-question`">
        <div
          v-for="(choice, idx) in displayQuestion.choices"
          :key="idx"
          class="question-card__choice"
          :class="{ 'question-card__choice--selected': selectedAnswer === idx + 1 }"
        >
          <label>
            <input
              v-model="selectedAnswer"
              type="radio"
              :name="`${groupId}-answer`"
              :value="idx + 1"
              :disabled="disabled || showReflectionPrompt || lockAnswerChoices"
              @change="onUserSelect(idx + 1)"
            />
            <span class="question-card__choice-text" dir="auto">
              <strong>{{ idx + 1 }}.</strong> {{ choice }}
            </span>
          </label>
        </div>
      </div>

      <BaseButton
        ref="submitButton"
        v-if="requireAnswerConfirmation && !lockAnswerChoices && selectedAnswer"
        variant="primary"
        :disabled="disabled || showReflectionPrompt"
        @click="commitAnswer"
      >{{ t('tests.submitAnswer') }}</BaseButton>

      <div v-if="requireAnswerConfirmation ? initialAnswer : selectedAnswer" class="confidence-row confidence-score">
        <BaseButton variant="ghost" raw-content class="answer-options-toggle" :aria-expanded="confidenceExpanded" :aria-controls="`${groupId}-confidence-options`" @click="confidenceExpanded = !confidenceExpanded">
          <span :id="`${groupId}-confidence-label`" class="confidence-score__label">{{ t('tests.confidencePrompt') }}</span>
          <span>{{ t(selectedConfidence.labelKey) }}</span>
          <i :class="confidenceExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" aria-hidden="true"></i>
        </BaseButton>
        <div v-show="confidenceExpanded" :id="`${groupId}-confidence-options`" class="confidence-score__options" role="radiogroup" :aria-labelledby="`${groupId}-confidence-label`">
          <label v-for="option in confidenceOptions" :key="option.value" class="confidence-score__option" :class="{ 'confidence-score__option--active': confidenceScore === option.value }">
            <input v-model.number="confidenceScore" type="radio" :name="`${groupId}-confidence`" :value="option.value" :disabled="disabled" @change="onConfidenceChange" />
            <span><i :class="option.icon" aria-hidden="true"></i> {{ t(option.labelKey) }}</span>
          </label>
        </div>
        <span v-if="confidenceExpanded && showConfidenceHint" class="confidence-hint">
          <i class="bi bi-info-circle" aria-hidden="true"></i> {{ t('tests.confidenceHint') }}
        </span>
      </div>

      <div v-if="showReflectionPrompt" class="reflection-prompt">
        <BaseButton variant="ghost" raw-content class="answer-options-toggle" :aria-expanded="reflectionExpanded" :aria-controls="`${groupId}-reflection-options`" @click="reflectionExpanded = !reflectionExpanded">
          <strong>{{ t('tests.reflectionTitle') }}</strong>
          <span>{{ t(selectedReflection.labelKey) }}</span>
          <i :class="reflectionExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" aria-hidden="true"></i>
        </BaseButton>
        <div v-show="reflectionExpanded" :id="`${groupId}-reflection-options`">
          <p class="reflection-prompt__hint">{{ t('tests.reflectionHint') }}</p>
          <div class="reflection-prompt__buttons" role="group" :aria-label="t('tests.reflectionTitle')">
            <BaseButton v-for="option in reflectionOptions" :key="option.value" variant="secondary" size="small" class="reflection-prompt__btn" :aria-pressed="initialErrorReason === option.value" :disabled="disabled || reflectionLocked" @click="pickReason(option.value)">
              {{ t(option.labelKey) }}
            </BaseButton>
          </div>
        </div>
      </div>
      <slot name="feedback"></slot>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, ref, watch, useId, nextTick } from 'vue'
import BaseMarkdown from '@/components/markdown/BaseMarkdown.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { localizedQuestion } from '@/utils/localizedQuestion'
import { normalizeConfidenceScore } from '@/utils/confidence'

const { t, locale } = useI18n()

const props = defineProps({
  question: { type: Object, required: true },
  initialAnswer: { type: Number, default: null },
  initialConfidence: { type: [Number, Boolean], default: null },
  answerBeforeOptions: { type: Boolean, default: false },
  initialPreAnswer: { type: String, default: '' },
  choicesRevealed: { type: Boolean, default: true },
  showVerification: { type: Boolean, default: true },
  showConfidenceHint: { type: Boolean, default: true },
  showReflectionPrompt: { type: Boolean, default: false },
  initialErrorReason: { type: String, default: 'unknown' },
  reflectionLocked: { type: Boolean, default: false },
  requireAnswerConfirmation: { type: Boolean, default: false },
  lockAnswerChoices: { type: Boolean, default: false },
  // When true, the answer radios and the confidence checkbox are
  // disabled. The master-exam runner binds this to the store's
  // in-flight answer flag so a second click cannot land while the
  // first is being saved. Defaults to false so every existing caller
  // (TestQuestion.vue, ExamStudy components) renders exactly as
  // before without any change on their side.
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['answer', 'confidence', 'reflection', 'reveal'])

const groupId = useId()
const submitButton = ref(null)
let restoreAnswerFocus = false
const selectedAnswer = ref(props.initialAnswer)
const confidenceScore = ref(normalizeConfidenceScore(props.initialConfidence))
const confidenceExpanded = ref(false)
const reflectionExpanded = ref(false)
const reflectionOptions = [
  { value: 'unknown', labelKey: 'tests.reflectionUnknown' },
  { value: 'misread', labelKey: 'tests.reflectionMisread' },
  { value: 'confused', labelKey: 'tests.reflectionConfused' },
  { value: 'guessed', labelKey: 'tests.reflectionGuessed' },
]
const selectedReflection = computed(() => reflectionOptions.find(option => option.value === props.initialErrorReason) || reflectionOptions[0])
const preAnswer = ref(props.initialPreAnswer || '')
const displayQuestion = computed(() => localizedQuestion(props.question, locale.value))
const confidenceOptions = [
  { value: 1, icon: 'bi bi-dice-5', labelKey: 'tests.confidenceGuessing' },
  { value: 2, icon: 'bi bi-question-circle', labelKey: 'tests.confidenceUncertain' },
  { value: 3, icon: 'bi bi-emoji-smile', labelKey: 'tests.confidenceCertain' },
]
const selectedConfidence = computed(() => confidenceOptions.find(option => option.value === confidenceScore.value) || confidenceOptions[2])

watch(
  () => props.question?.id,
  () => {
    confidenceExpanded.value = false
    reflectionExpanded.value = false
    selectedAnswer.value = props.initialAnswer
    confidenceScore.value = normalizeConfidenceScore(props.initialConfidence)
    preAnswer.value = props.initialPreAnswer || ''
  },
)

watch(
  () => props.initialAnswer,
  (val) => {
    selectedAnswer.value = val
  },
)

watch(
  () => props.initialConfidence,
  (val) => {
    confidenceScore.value = normalizeConfidenceScore(val)
  },
)

watch(
  () => props.initialPreAnswer,
  (val) => {
    preAnswer.value = val || ''
  },
)

function commitAnswer() {
  restoreAnswerFocus = submitButton.value?.$el === document.activeElement
  emit('answer', selectedAnswer.value)
}

watch(() => props.lockAnswerChoices && !props.disabled, async (locked) => {
  if (!locked || !restoreAnswerFocus) return
  restoreAnswerFocus = false
  await nextTick()
  document.getElementById(`${groupId}-confidence-label`)?.closest('button')?.focus()
})

function onUserSelect(val) {
  if (!props.requireAnswerConfirmation) emit('answer', val)
}

function onConfidenceChange() {
  emit('confidence', confidenceScore.value)
  confidenceExpanded.value = false
}

function revealChoices() {
  const clean = preAnswer.value.trim()
  if (clean) emit('reveal', clean)
}

function pickReason(reason) {
  emit('reflection', reason)
  reflectionExpanded.value = false
}
</script>
