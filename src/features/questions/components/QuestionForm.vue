<!-- frontend/src/features/questions/components/QuestionForm.vue -->
<template>
  <BaseCard class="question-form-card">
    <Transition name="splash">
      <div v-if="showSplash" class="question-form__splash">
        <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
      </div>
    </Transition>

    <form class="question-form__form" @submit.prevent="submitWithGuard">
      <fieldset class="form-lock-group" :disabled="isLoading || saveBlocked">
      <!--
        Case section (feature: case-based question chains).

        The `case_key` field is a plain string input backed by a
        native <datalist>. Existing keys autocomplete; a new key
        creates the case on save. Clearing the field detaches the
        question from whatever case it was in.
      -->
      <details class="question-form__case-section">
        <summary class="question-form__case-summary">
          <i class="bi bi-journal-medical" aria-hidden="true"></i>
          <span>{{ t('questions.caseSection') }}</span>
          <BaseBadge v-if="form.case_key" variant="info" small class="question-form__case-badge">{{ form.case_key }}</BaseBadge>
        </summary>
        <FormGrid>
          <div>
            <BaseInput
              v-model.trim="form.case_key"
              :label="t('questions.caseKeyLabel')"
              :hint="t('questions.caseKeyHint')"
              list="case-key-suggestions"
              :maxlength="64"
              :placeholder="t('questions.caseKeyPlaceholder')"
            />
            <datalist id="case-key-suggestions">
              <option v-for="c in availableCases" :key="c.key" :value="c.key">
                {{ c.title || c.key }}
              </option>
            </datalist>
          </div>
        </FormGrid>
        <MarkdownEditor
          id="q-case-stem"
          v-model="form.case_stem"
          :label="t('questions.caseStemLabel')"
          :maxlength="3000"
          :rows="5"
        />
        <p
          v-if="form.case_key"
          class="text-muted question-form__case-hint"
        >
          <i class="bi bi-info-circle" aria-hidden="true"></i>
          {{ t('questions.caseStemHint') }}
        </p>
      </details>

      <MarkdownEditor
        id="q-question"
        v-model="form.question"
        :label="t('questions.questionLabel')"
        :maxlength="3000"
        required
      />

      <details class="question-form__case-section">
        <summary class="question-form__case-summary">
          <i class="bi bi-bullseye" aria-hidden="true"></i>
          <span>{{ t('questions.knowledgeObjectSection') }}</span>
          <BaseBadge v-if="selectedKnowledgeObject" variant="info" small class="question-form__case-badge">
            {{ selectedKnowledgeObject.title }}
          </BaseBadge>
        </summary>
        <p class="text-muted question-form__case-hint">
          {{ t('questions.knowledgeObjectHint') }}
        </p>
        <FormGrid>
          <BaseSelect
            v-model="form.knowledge_object"
            :label="t('questions.knowledgeObjectLabel')"
            :options="knowledgeObjectOptions"
            :placeholder="t('questions.noKnowledgeObject')"
          />
          <div class="form-group question-form__knowledge-action">
            <BaseButton
              type="button"
              variant="secondary"
              @click="showKnowledgeCreator = !showKnowledgeCreator"
            >
              <i :class="showKnowledgeCreator ? 'bi bi-dash-lg' : 'bi bi-plus-lg'" aria-hidden="true"></i>
              {{
                showKnowledgeCreator
                  ? t('questions.knowledgeObjectCancelCreate')
                  : t('questions.knowledgeObjectCreate')
              }}
            </BaseButton>
          </div>
        </FormGrid>

        <div v-if="showKnowledgeCreator" class="question-form__knowledge-creator">
          <FormGrid>
            <BaseInput
              v-model.trim="knowledgeDraft.title"
              :label="t('questions.knowledgeObjectTitle')"
              :maxlength="200"
              show-count
              :placeholder="t('questions.knowledgeObjectTitlePlaceholder')"
            />
            <BaseTextarea
              v-model.trim="knowledgeDraft.learning_objective"
              :label="t('questions.knowledgeObjectObjective')"
              :rows="3"
              :maxlength="3000"
              :placeholder="t('questions.knowledgeObjectObjectivePlaceholder')"
            />
          </FormGrid>
          <BaseTextarea
            v-model.trim="knowledgeDraft.canonical_answer"
            :label="t('questions.knowledgeObjectAnswer')"
            :rows="3"
            :maxlength="3000"
            :placeholder="t('questions.knowledgeObjectAnswerPlaceholder')"
          />
          <BaseTextarea
            v-model="knowledgeDraft.key_facts"
            :label="t('questions.knowledgeObjectFacts')"
            :hint="t('questions.knowledgeObjectFactsHint')"
            :rows="3"
            :placeholder="t('questions.knowledgeObjectFactsPlaceholder')"
          />
          <BaseButton
            type="button"
            variant="primary"
            :loading="creatingKnowledgeObject"
            @click="createKnowledgeObject"
          >
            <i class="bi bi-check-lg" aria-hidden="true"></i>
            {{ t('questions.knowledgeObjectCreateAndSelect') }}
          </BaseButton>
        </div>
      </details>

      <div class="form-group">
        <label>{{ t('questions.imageSection') }}</label>
        <div
          v-if="!imagePreview"
          class="image-dropzone"
          :class="{ 'image-dropzone--dragging': isDraggingImage }"
          @dragenter.prevent="isDraggingImage = true"
          @dragleave.prevent="isDraggingImage = false"
          @dragover.prevent
          @drop.prevent="handleImageDrop"
        >
          <input
            type="file"
            class="image-dropzone__input"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            @change="handleImagePick"
          />
          <div class="image-dropzone__icon"><i class="bi bi-image" aria-hidden="true"></i></div>
          <p class="image-dropzone__text">{{ t('questions.imageDropHint') }}</p>
          <small class="image-dropzone__hint">{{ t('questions.imageTypeHint') }}</small>
        </div>
        <div v-else class="image-preview">
          <img :src="imagePreview" :alt="t('questions.imagePreviewAlt')" />
          <BaseIconButton
            type="button"
            class="image-preview__remove"
            icon="bi bi-x-lg"
            variant="danger"
            :label="t('questions.imageRemove')"
            @click="clearImage"
          />
          <BaseBadge variant="info" class="image-preview__status">
            <i class="bi bi-info-circle" aria-hidden="true"></i>
            {{ imageUploadStatus }}
          </BaseBadge>
        </div>
      </div>

      <FormGrid>
        <CategorySelect v-model="form.category_id" />
        <div class="form-group">
          <label>{{ t('questions.difficultyLabel') }}</label>
          <DifficultySelector v-model="form.difficulty" />
        </div>
        <TagInput v-model="form.tags" />
      </FormGrid>

      <div id="q-choices" class="question-form__choices" role="group" aria-labelledby="q-choices-label" tabindex="-1" :aria-describedby="(validationErrors.choices || validationErrors.answer) ? 'q-choices-errors' : undefined" @focusout="touchChoices">
        <h4 id="q-choices-label">{{ t('questions.choicesLabel') }}</h4>
        <ChoiceEditor v-model="form.choices" v-model:correct-answer="form.correct_answer" />
        <div v-if="validationErrors.choices || validationErrors.answer" id="q-choices-errors" role="alert">
          <p v-if="validationErrors.choices" class="base-field__error">{{ validationErrors.choices }}</p>
          <p v-if="validationErrors.answer" class="base-field__error">{{ validationErrors.answer }}</p>
        </div>
      </div>

      <MarkdownEditor
        id="q-explanation"
        v-model="form.explanation"
        :label="t('questions.explanationLabel')"
        :maxlength="3000"
      />

      <details class="question-form__case-section">
        <summary class="question-form__case-summary">
          <i class="bi bi-book" aria-hidden="true"></i>
          <span>{{ t('questions.provenanceSection') }}</span>
        </summary>
        <FormGrid>
          <BaseInput
            id="q-source"
            v-model="form.source"
            :label="t('questions.sourceLabel')"
            :hint="t('questions.sourcePlaceholder')"
            :maxlength="200"
            show-count
          />
          <BaseInput
            id="q-source-document"
            v-model="form.source_document"
            :label="t('questions.sourceDocumentLabel')"
            :hint="t('questions.sourceDocumentHint')"
            :maxlength="500"
            show-count
            :placeholder="t('questions.sourceDocumentPlaceholder')"
          />
          <BaseInput
            id="q-source-page"
            v-model="form.source_page"
            type="number"
            :label="t('questions.sourcePageLabel')"
            :min="1"
            :step="1"
            :placeholder="t('questions.sourcePagePlaceholder')"
          />
          <BaseInput
            id="q-last-revised"
            v-model="form.last_revised_at"
            type="date"
            :label="t('questions.lastRevisedLabel')"
            :hint="t('questions.lastRevisedHint')"
          />
        </FormGrid>
      </details>

      <details class="question-form__case-section">
        <summary class="question-form__case-summary">
          <i class="bi bi-translate" aria-hidden="true"></i>
          <span>{{ t('questions.translationsSection') }}</span>
          <BaseBadge v-if="translationCount" variant="info" small class="question-form__case-badge">
            {{ translationCount }}
          </BaseBadge>
        </summary>
        <p class="text-muted question-form__case-hint">
          {{ t('questions.translationsHint') }}
        </p>
        <div class="question-form__translation-add">
          <BaseInput
            id="q-translation-locale"
            :error="validationErrors.translationLocale"
            v-model.trim="translationLocale"
            :label="t('questions.translationLocaleLabel')"
            :maxlength="6"
            show-count
            :placeholder="t('questions.translationLocalePlaceholder')"
            @enter="addTranslation"
          />
          <BaseButton type="button" variant="secondary" @click="addTranslation">
            <i class="bi bi-plus-lg" aria-hidden="true"></i> {{ t('questions.translationAdd') }}
          </BaseButton>
        </div>

        <section
          v-for="(translation, locale) in form.translations"
          :key="locale"
          class="question-form__translation"
        >
          <header class="question-form__translation-header">
            <strong>{{ locale }}</strong>
            <BaseButton
              type="button"
              variant="danger"
              size="small"
              @click="removeTranslation(locale)"
            >
              <i class="bi bi-trash" aria-hidden="true"></i> {{ t('common.delete') }}
            </BaseButton>
          </header>
          <MarkdownEditor
            :id="`q-translation-${locale}-question`"
            :error="validationErrors.translations[locale]?.question || ''"
            @blur="touchTranslations"
            v-model="translation.question"
            :label="t('questions.translationQuestionLabel')"
            :maxlength="3000"
          />
          <div class="question-form__translation-choices">
            <BaseInput
              v-for="(_, index) in form.choices"
              :key="`${locale}-${index}`"
              :id="`q-translation-${locale}-choice-${index}`"
              :error="!String(translation.choices[index] || '').trim() ? validationErrors.translations[locale]?.choices || '' : ''"
              @blur="touchTranslations"
              v-model="translation.choices[index]"
              :label="t('questions.choiceN', { n: index + 1 })"
              :maxlength="1000"
              show-count
            />
          </div>
          <MarkdownEditor
            :id="`q-translation-${locale}-explanation`"
            v-model="translation.explanation"
            :label="t('questions.translationExplanationLabel')"
            :maxlength="3000"
          />
        </section>
      </details>

      <div v-if="form.verified_by" class="verification-info">
        <span
          ><i class="bi bi-patch-check-fill" aria-hidden="true"></i> {{ t('questions.verified') }} —
          {{ form.verified_by }}</span
        >
        <span v-if="form.verified_at">{{ formatDate(form.verified_at) }}</span>
      </div>
      <p class="text-muted question-form__verification-hint">
        <i class="bi bi-info-circle" aria-hidden="true"></i>
        {{ t('questions.verifyHint') }}
      </p>

      <div class="form-actions">
        <BaseButton type="submit" variant="primary" :loading="isLoading || isSubmitting">{{
          submitLabel
        }}</BaseButton>
        <BaseButton type="button" variant="secondary" @click="router.push('/questions')">{{
          t('common.cancel')
        }}</BaseButton>
      </div>
      </fieldset>
    </form>
  </BaseCard>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useCaseStore } from '@/stores/caseStore'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import CategorySelect from './CategorySelect.vue'
import DifficultySelector from './DifficultySelector.vue'
import TagInput from './TagInput.vue'
import ChoiceEditor from './ChoiceEditor.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import FormGrid from '@/components/common/FormGrid.vue'
import { useSubmitGuard } from '@/composables/useSubmitGuard'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { formatDate } from '@/utils/formatters'
import {
  normalizeQuestionChoices,
  validateChoices,
  validateCorrectAnswer,
} from '@/utils/questionValidators'
import { FALLBACK_MAX_CHOICES } from '@/utils/constants'
import { useNotify } from '@/composables/useNotify'
import { validateFile, FILE_VALIDATION_REASONS } from '@/utils/fileValidation'
import { useKnowledgeStore } from '@/stores/knowledgeStore'

const { t, locale: uiLocale } = useI18n()

const props = defineProps({ question: Object, loading: Boolean, saveBlocked: Boolean })
const emit = defineEmits(['save'])

const router = useRouter()
const { isSubmitting, guard } = useSubmitGuard()
const { notify } = useNotify()
const configStore = useConfigStore()
const caseStore = useCaseStore()
const knowledgeStore = useKnowledgeStore()

const isLoading = computed(() => Boolean(props.loading))
const isEdit = computed(() => !!props.question)
const submitLabel = computed(() => (isEdit.value ? t('questions.update') : t('questions.save')))
const showSplash = ref(false)

const pendingImageFile = ref(null)
const imagePreview = ref(null)
const imageCleared = ref(false)
const isDraggingImage = ref(false)
const knowledgeObjects = computed(() => knowledgeStore.items)
const showKnowledgeCreator = ref(false)
const creatingKnowledgeObject = computed(() => knowledgeStore.isCreateLoading)
const initialRevisionDate = ref('')

const knowledgeDraft = reactive({
  title: '',
  learning_objective: '',
  canonical_answer: '',
  key_facts: '',
})

// Cases for the picker datalist. Populated once on mount; the list
// is short enough that re-fetching on every render would be wasteful.
const availableCases = computed(() => caseStore.items)

const imageUploadStatus = computed(() => {
  if (pendingImageFile.value) return t('questions.imagePending')
  if (imageCleared.value) return t('questions.imageCleared')
  return t('questions.imageSaved')
})

const form = reactive({
  question: '',
  choices: ['', ''],
  correct_answer: 1,
  explanation: '',
  source: '',
  source_document: '',
  source_page: '',
  knowledge_object: '',
  last_revised_at: '',
  translations: {},
  tags: '',
  difficulty: 'medium',
  category_id: null,
  verified_by: null,
  verified_at: null,
  // ── Case linkage ─────────────────────────────────────────────────
  // `case_key` is the human-readable case identifier. Null/empty
  // means "standalone question". `case_stem` is only consulted by
  // the backend when the case is being created for the first time;
  // editing a stem on an existing case goes through the dedicated
  // case-stem endpoint. See the hint text below the field.
  case_key: '',
  case_stem: '',
})

const { isDirty, markClean, allowNextNavigation } = useUnsavedChanges(
  () => ({
    form,
    pendingImageFile: pendingImageFile.value,
    imageCleared: imageCleared.value,
  }),
  { message: () => t('common.unsavedChanges') },
)

defineExpose({ isDirty, markClean, allowNextNavigation })

const selectedKnowledgeObject = computed(() =>
  knowledgeObjects.value.find((item) => Number(item.id) === Number(form.knowledge_object)),
)
const knowledgeObjectOptions = computed(() =>
  knowledgeObjects.value.map(item => ({ value: item.id, label: item.title })),
)

const validationErrors = reactive({ choices: '', answer: '', translationLocale: '', translations: {} })
const choicesTouched = ref(false)
const translationsTouched = ref(false)
function validateChoiceFields() {
  const max = configStore.maxChoices || FALLBACK_MAX_CHOICES
  validationErrors.choices = validateChoices(form.choices, 2, max).message || ''
  validationErrors.answer = validateCorrectAnswer(form.correct_answer, form.choices, max).message || ''
}
function touchChoices() { choicesTouched.value = true; validateChoiceFields() }
function touchTranslations() { translationsTouched.value = true; buildTranslations() }
watch(() => [form.choices, form.correct_answer], () => {
  if (choicesTouched.value) validateChoiceFields()
}, { deep: true })
watch(() => form.translations, () => {
  if (translationsTouched.value) buildTranslations()
}, { deep: true })
watch(uiLocale, () => {
  if (choicesTouched.value) validateChoiceFields()
  if (translationsTouched.value) buildTranslations()
  if (validationErrors.translationLocale) validationErrors.translationLocale = t('questions.translationLocaleInvalid')
})
async function focusInvalid(id) {
  await nextTick()
  const element = document.getElementById(id)
  let parent = element?.parentElement
  while (parent) {
    if (parent.tagName === 'DETAILS') parent.open = true
    parent = parent.parentElement
  }
  const control = element?.matches('input, textarea, select') ? element : element?.querySelector('input, textarea, select') || element
  control?.focus()
}

const translationLocale = ref('')
const translationCount = computed(() => Object.keys(form.translations).length)

watch(
  () => props.loading,
  (now, before) => {
    if (before && !now) {
      showSplash.value = false
    }
  },
)

onMounted(async () => {
  if (props.question) {
    form.choices =
      props.question.choices && props.question.choices.length >= 2
        ? [...props.question.choices]
        : ['', '']
    form.question = props.question.question || ''
    form.correct_answer = props.question.correct_answer || 1
    form.explanation = props.question.explanation || ''
    form.source = props.question.source || ''
    form.source_document = props.question.source_document || ''
    form.source_page = props.question.source_page || ''
    form.knowledge_object = props.question.knowledge_object || ''
    form.last_revised_at = props.question.last_revised_at || ''
    initialRevisionDate.value = form.last_revised_at
    form.translations = Object.fromEntries(
      Object.entries(props.question.translations || {}).map(([locale, content]) => [
        locale,
        {
          question: content?.question || '',
          choices: [...(content?.choices || [])],
          explanation: content?.explanation || '',
        },
      ]),
    )
    syncTranslationChoices()
    form.tags = Array.isArray(props.question.tags)
      ? props.question.tags.join(', ')
      : props.question.tags || ''
    form.difficulty = props.question.difficulty || 'medium'
    form.category_id = props.question.category ?? null
    form.verified_by = props.question.verified_by || null
    form.verified_at = props.question.verified_at || null
    form.case_key = props.question.case?.key || ''
    form.case_stem = props.question.case?.stem || ''
    if (props.question.image_url) {
      imagePreview.value = props.question.image_url
    }
  }

  markClean()

  // Populate the datalist. Failures are non-fatal — the picker
  // degrades to a plain text input.
  await Promise.all([caseStore.fetchList({ limit: 100 }), loadKnowledgeObjects()])
})

async function loadKnowledgeObjects() {
  // Include draft/retired objects so an existing question never loses its
  // visible selection merely because the linked objective changed status.
  await knowledgeStore.fetchList()
}

function lines(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function createKnowledgeObject() {
  if (!knowledgeDraft.title || !knowledgeDraft.learning_objective) {
    notify(t('questions.knowledgeObjectRequired'), 'error')
    return
  }

  const created = await knowledgeStore.create({
    title: knowledgeDraft.title,
    learning_objective: knowledgeDraft.learning_objective,
    canonical_answer: knowledgeDraft.canonical_answer,
    key_facts: lines(knowledgeDraft.key_facts),
    category: form.category_id || null,
    status: 'active',
  })
  if (!created) {
    notify(
      knowledgeStore.createError || t('questions.knowledgeObjectCreateFailed'),
      'error',
    )
    return
  }

  form.knowledge_object = created.id
  showKnowledgeCreator.value = false
  Object.assign(knowledgeDraft, {
    title: '',
    learning_objective: '',
    canonical_answer: '',
    key_facts: '',
  })
  notify(t('questions.knowledgeObjectCreated'), 'success')
}

watch(
  () => form.choices.length,
  () => syncTranslationChoices(),
)

function normalizeLocale(value) {
  const parts = String(value || '').trim().replaceAll('_', '-').split('-')
  if (parts.length < 1 || parts.length > 2) return ''
  if (parts.length === 1) return parts[0].toLowerCase()
  return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`
}

function syncTranslationChoices() {
  for (const translation of Object.values(form.translations)) {
    if (!Array.isArray(translation.choices)) translation.choices = []
    while (translation.choices.length < form.choices.length) translation.choices.push('')
    if (translation.choices.length > form.choices.length) {
      translation.choices.splice(form.choices.length)
    }
  }
}

function addTranslation() {
  const locale = normalizeLocale(translationLocale.value)
  if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(locale)) {
    validationErrors.translationLocale = t('questions.translationLocaleInvalid')
    focusInvalid('q-translation-locale')
    return
  }
  if (!form.translations[locale]) {
    form.translations[locale] = {
      question: '',
      choices: Array(form.choices.length).fill(''),
      explanation: '',
    }
  }
  validationErrors.translationLocale = ''
  translationLocale.value = ''
}

function removeTranslation(locale) {
  delete form.translations[locale]
}

function buildTranslations() {
  const output = {}
  validationErrors.translations = {}
  let valid = true
  for (const [locale, content] of Object.entries(form.translations)) {
    const question = String(content.question || '').trim()
    const explanation = String(content.explanation || '').trim()
    const choices = (content.choices || [])
      .slice(0, form.choices.length)
      .map((choice) => String(choice || '').trim())
    const hasChoices = choices.some(Boolean)
    const hasContent = question || explanation || hasChoices
    if (!hasContent) continue
    if (!question) {
      validationErrors.translations[locale] = { question: t('questions.translationQuestionRequired', { locale }) }
      valid = false
    }
    if (hasChoices && choices.some((choice) => !choice)) {
      validationErrors.translations[locale] = { ...validationErrors.translations[locale], choices: t('questions.translationChoicesIncomplete', { locale }) }
      valid = false
    }
    output[locale] = {
      question,
      choices: hasChoices ? choices : [],
      explanation,
    }
  }
  return valid ? output : null
}

function validateImageFile(file) {
  const result = validateFile(file, {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSizeMb: 5,
  })
  if (result.ok) return true

  if (result.reason === FILE_VALIDATION_REASONS.WRONG_TYPE) {
    notify(t('questions.imageBadType'), 'error')
  } else {
    notify(t('questions.imageTooLarge'), 'error')
  }
  return false
}

function setImageFromFile(file) {
  if (!validateImageFile(file)) return
  pendingImageFile.value = file
  imageCleared.value = false
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = URL.createObjectURL(file)
}

function handleImagePick(e) {
  const file = e.target.files?.[0]
  if (file) setImageFromFile(file)
  e.target.value = ''
}

function handleImageDrop(e) {
  isDraggingImage.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) setImageFromFile(file)
}

function clearImage() {
  pendingImageFile.value = null
  imageCleared.value = true
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = null
}

async function handleSubmit() {
  touchChoices()
  if (validationErrors.choices || validationErrors.answer) {
    const seen = new Set()
    let index = form.choices.findIndex(choice => !String(choice || '').trim())
    if (validationErrors.choices) {
      const duplicate = form.choices.findIndex(choice => {
        const value = String(choice || '').trim().toLowerCase()
        if (!value) return false
        if (seen.has(value)) return true
        seen.add(value)
        return false
      })
      if (duplicate >= 0) index = duplicate
    } else index = form.correct_answer - 1
    await focusInvalid(`q-choice-${Math.max(0, index)}`)
    return
  }

  showSplash.value = true

  const { choices: filteredChoices, correctAnswer: remappedCorrectAnswer } =
    normalizeQuestionChoices(form.choices, form.correct_answer)

  if (remappedCorrectAnswer === null) {
    showSplash.value = false
    validationErrors.answer = t('validation.correctAnswerEmpty')
    await focusInvalid('q-choices')
    return
  }

  translationsTouched.value = true
  const translations = buildTranslations()
  if (translations === null) {
    showSplash.value = false
    const locale = Object.keys(validationErrors.translations)[0]
    const errors = validationErrors.translations[locale]
    const index = form.translations[locale].choices.findIndex(choice => !String(choice || '').trim())
    await focusInvalid(errors.question ? `q-translation-${locale}-question` : `q-translation-${locale}-choice-${index}`)
    return
  }

  const payload = {
    question: form.question,
    choices: filteredChoices,
    correct_answer: remappedCorrectAnswer,
    explanation: form.explanation,
    source: form.source,
    source_document: form.source_document || null,
    source_page: form.source_page ? Number(form.source_page) : null,
    translations,
    tags: form.tags,
    difficulty: form.difficulty,
    category:
      form.category_id === '' || form.category_id === null ? null : Number(form.category_id),
    knowledge_object: form.knowledge_object ? Number(form.knowledge_object) : null,
    // ── Case linkage ─────────────────────────────────────────────────
    // Emitted under the write-side field name the backend expects.
    // A null/empty case_key detaches the question.
    case_key: form.case_key || null,
    case_stem: form.case_stem || null,
    __pending_image: pendingImageFile.value,
    __clear_image: imageCleared.value,
  }

  if (!isEdit.value || form.last_revised_at !== initialRevisionDate.value) {
    payload.last_revised_at = form.last_revised_at || undefined
  }

  emit('save', payload)
}

function submitWithGuard() {
  if (props.loading || props.saveBlocked) return
  guard(handleSubmit)
}
</script>
