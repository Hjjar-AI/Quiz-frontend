<template>
  <details class="question-form__case-section" @toggle="onToggle">
    <summary class="question-form__case-summary">{{ t('questions.caseTranslations') }}</summary>
    <p class="text-muted" dir="auto">{{ t('questions.caseTranslationsHint') }}</p>
    <FeedbackRegion scope="section" :error="error" :warning="needsReview ? t('questions.caseTranslationsReview') : ''" :success="saved ? t('questions.caseTranslationsSaved') : ''" />
    <BaseButton v-if="!record || needsReview || error" type="button" variant="secondary" :loading="busy" :disabled="disabled" @click="load">{{ t('common.refresh') }}</BaseButton>
    <template v-if="record">
      <BaseSelect v-model="language" :label="t('questions.translationLocaleLabel')" :options="languages" :disabled="busy || disabled" />
      <fieldset class="form-lock-group" :disabled="!editable">
      <MarkdownEditor :id="`${fieldId}-title`" v-model="draft[language].title" :label="t('questions.caseTranslationTitle')" :maxlength="200" :rows="2" :disabled="!editable" :error="fieldError('title')" @update:model-value="saved = false" @blur="touched.title = true" />
      <MarkdownEditor :id="`${fieldId}-stem`" v-model="draft[language].stem" :label="t('questions.caseStemLabel')" :maxlength="3000" :rows="5" :disabled="!editable" :error="fieldError('stem')" @update:model-value="saved = false" @blur="touched.stem = true" />
      </fieldset>
      <p v-if="!mayEdit(record)" class="text-muted">{{ t('questions.caseTranslationsDenied') }}</p>
      <template v-if="needsReview && reviewed">
        <p>{{ t('questions.caseTranslationsServer') }}</p>
        <BaseMarkdown v-if="server?.translations?.[language]?.title" :text="server.translations[language].title" />
        <BaseMarkdown v-if="server?.translations?.[language]?.stem" :text="server.translations[language].stem" />
        <BaseButton type="button" variant="secondary" :disabled="busy || disabled || !mayEdit(server)" @click="resolve(true)">{{ t('common.keepDraft') }}</BaseButton>
        <BaseButton type="button" variant="secondary" :disabled="busy || disabled" @click="resolve(false)">{{ t('common.useServer') }}</BaseButton>
      </template>
      <BaseButton type="button" :loading="writing" :disabled="!editable || !isDirty" @click="save">{{ t('questions.caseTranslationsSave') }}</BaseButton>
      <BaseButton v-if="isDirty && !needsReview" type="button" variant="secondary" :disabled="busy || disabled" @click="discard">{{ t('common.cancel') }}</BaseButton>
    </template>
  </details>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { caseService } from '@/services/caseService'
import { sessionGeneration } from '@/services/api/sessionScope'
import { useAuthStore } from '@/stores/authStore'
import { useCaseStore } from '@/stores/caseStore'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { useDialog } from '@/composables/useDialog'
import { useNotify } from '@/composables/useNotify'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import BaseMarkdown from '@/components/markdown/BaseMarkdown.vue'

const props = defineProps({ caseKey: { type: String, required: true }, disabled: Boolean })
const emit = defineEmits(['blocking'])
const { t } = useI18n()
const auth = useAuthStore()
const cases = useCaseStore()
const { confirm } = useDialog()
const { notify } = useNotify()
const fieldId = useId()
const record = ref(null)
const server = ref(null)
const draft = ref({})
const language = ref('ar')
const busy = ref(false)
const writing = ref(false)
const needsReview = ref(false)
const reviewed = ref(false)
const saved = ref(false)
const error = ref('')
const touched = reactive({ title: false, stem: false })
let alive = true
let request = 0
let ownerKey = ''
const { isDirty, markClean } = useUnsavedChanges(
  () => ({ draft: draft.value, needsReview: needsReview.value, writing: writing.value }),
  { message: () => t('common.unsavedChanges') },
)
watch(language, () => { touched.title = false; touched.stem = false })
const languages = computed(() => Object.keys(draft.value).map(value => ({ value, label: value })))
function mayEdit(row) {
  if (!row || !auth.isAuthenticated) return false
  return auth.can('questions.edit_case_stem_any') ||
    (auth.can('questions.edit_case_stem_own') && row.questions?.some(q => Number(q.authored_by) === Number(auth.user.id)))
}
const editable = computed(() => mayEdit(record.value) && !busy.value && !needsReview.value && !props.disabled && ownerKey === props.caseKey)
watch(() => [busy.value, needsReview.value, isDirty.value], () => emit('blocking', busy.value || needsReview.value || isDirty.value))
function fill(row) {
  draft.value = Object.fromEntries([...new Set(['ar', 'en', ...Object.keys(row.translations || {})])].map(code => [code, {
    title: row.translations?.[code]?.title || '', stem: row.translations?.[code]?.stem || '',
  }]))
  if (!draft.value[language.value]) language.value = 'ar'
  touched.title = false; touched.stem = false
}
function scope() { return { generation: sessionGeneration(), key: props.caseKey, account: auth.user?.id, request: ++request } }
function current(s) { return alive && s.generation === sessionGeneration() && s.account === auth.user?.id && s.key === props.caseKey && s.request === request }
function payload() {
  return Object.fromEntries(Object.entries(draft.value).flatMap(([code, values]) => {
    const fields = Object.fromEntries(Object.entries(values).map(([field, value]) => [field, value.trim()]).filter(([, value]) => value))
    return Object.keys(fields).length ? [[code, fields]] : []
  }))
}
function fieldError(field) {
  return touched[field] && String(draft.value[language.value]?.[field] || '').trim().length > (field === 'title' ? 200 : 3000)
    ? t('questions.caseTranslationTooLong') : ''
}
async function load() {
  if (busy.value || props.disabled || !auth.canAny('questions.edit_case_stem_any', 'questions.edit_case_stem_own')) return
  const s = scope(); busy.value = true; error.value = ''
  let clean = false
  try {
    const fresh = await caseService.get(s.key)
    if (!current(s)) return
    if (needsReview.value || isDirty.value) { server.value = fresh; needsReview.value = true; reviewed.value = true }
    else { record.value = fresh; ownerKey = s.key; fill(fresh); clean = true }
  } catch (failure) {
    if (current(s)) error.value = Number(failure.code) === 404 ? t('questions.caseTranslationsCreateFirst') : failure.message || t('common.unexpectedError')
  } finally {
    if (current(s)) { busy.value = false; if (clean) markClean() }
  }
}
function onToggle(event) { if (event.target.open && !record.value) load() }
function resolve(keep) {
  if (busy.value || props.disabled || !reviewed.value || !server.value || (keep && !mayEdit(server.value))) return
  record.value = server.value; ownerKey = props.caseKey
  if (!keep) fill(server.value)
  needsReview.value = false; reviewed.value = false; error.value = ''; saved.value = false
  if (!keep) markClean()
}
async function discard() {
  if (busy.value || needsReview.value || props.disabled) return
  const s = scope()
  if (!await confirm(t('common.unsavedChanges'), 'warning') || !current(s)) return
  fill(record.value); error.value = ''; markClean()
}
async function save() {
  if (!editable.value || !isDirty.value) return
  touched.title = true; touched.stem = true
  const invalid = Object.entries(draft.value).find(([, value]) => value.title.trim().length > 200 || value.stem.trim().length > 3000)
  if (invalid) { language.value = invalid[0]; await nextTick(); document.getElementById(`${fieldId}-${invalid[1].title.trim().length > 200 ? 'title' : 'stem'}`)?.focus(); return }
  const s = scope(); const body = payload(); busy.value = true; saved.value = false; error.value = ''; let dispatched = false
  try {
    const fresh = await caseService.get(s.key)
    if (!current(s)) return
    if (!mayEdit(fresh)) { error.value = t('questions.caseTranslationsDenied'); record.value = fresh; return }
    if (fresh.version !== record.value.version) { server.value = fresh; needsReview.value = true; reviewed.value = true; return }
    writing.value = true; dispatched = true
    const result = await caseService.updateTranslations(s.key, body, fresh.version)
    if (!current(s)) return
    // Detect an older server silently ignoring the additive request field.
    const canonical = value => JSON.stringify(Object.entries(value || {}).map(([key, fields]) => [key.toLowerCase().replaceAll('_', '-'), Object.entries(fields).sort()]).sort(([a], [b]) => a.localeCompare(b)))
    if (canonical(result.translations) !== canonical(body)) throw new Error(t('questions.caseTranslationsNotConfirmed'))
    record.value = { ...result, questions: fresh.questions }; fill(record.value)
    cases.items = cases.items.map(row => row.key === s.key ? { ...row, ...result } : row)
    writing.value = false; saved.value = true; markClean(); notify(t('questions.caseTranslationsSaved'), 'success')
  } catch (failure) {
    if (!current(s)) return
    error.value = failure.message || t('common.unexpectedError')
    if (dispatched && ![400, 401, 403, 404, 409, 422, 429].includes(Number(failure.code))) { needsReview.value = true; reviewed.value = false }
    if (Number(failure.code) === 409) { needsReview.value = true; reviewed.value = false }
  } finally { if (current(s)) { busy.value = false; writing.value = false } }
}
watch(() => [props.caseKey, auth.user?.id, auth.user?.uuid], () => {
  request++; record.value = null; server.value = null; draft.value = {}; ownerKey = ''
  busy.value = false; writing.value = false; needsReview.value = false; reviewed.value = false; error.value = ''; saved.value = false
  markClean(); emit('blocking', false)
})
onBeforeUnmount(() => { alive = false; request++; emit('blocking', false) })
</script>
