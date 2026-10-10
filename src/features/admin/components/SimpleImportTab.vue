<template>
  <div class="simple-import-tab" :aria-busy="loading || undefined">
    <DropZone
      :accept="accept"
      :multiple="multiple"
      :label="label"
      :hint="hint"
      :disabled="loading"
      :max-size-mb="maxSizeMb"
      :invalid-type-message-fn="invalidTypeMessageFn"
      @file-selected="handleFileSelect"
      @files-selected="handleFilesSelect"
    />

    <div v-if="files.length" class="simple-import-tab__queue" aria-live="polite">
      <EntityRow v-for="entry in files" :key="entry.id" :title="entry.file.name" :description="entry.message">
        <template #status>{{ statusLabels[entry.status] }}</template>
        <template #actions>
          <BaseButton variant="ghost" size="small" :disabled="loading" :aria-label="t('admin.import.queue.removeFile', { name: entry.file.name })" @click="removeFile(entry)">
            {{ t('admin.import.queue.remove') }}
          </BaseButton>
        </template>
      </EntityRow>
    </div>
    <FeedbackRegion v-if="hasFailure" scope="section" :warning="t('admin.import.queue.reviewFailure')" />

    <div class="simple-import-tab__actions">
      <BaseButton variant="primary" :loading="loading" :disabled="!hasPending" @click="upload">
        <i :class="buttonIcon" aria-hidden="true"></i> {{ buttonLabel }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import DropZone from '@/components/common/DropZone.vue'
import EntityRow from '@/components/common/EntityRow.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useNotify } from '@/composables/useNotify'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { sessionGeneration } from '@/services/api/sessionScope'

const { t } = useI18n()
const props = defineProps({
  accept: { type: String, required: true },
  multiple: { type: Boolean, default: false },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  buttonIcon: { type: String, default: 'bi bi-upload' },
  buttonLabel: { type: String, required: true },
  allowedExtensions: { type: Array, required: true },
  invalidTypeMessageFn: { type: Function, required: true },
  maxSizeMb: { type: Number, default: 50 },
  uploadFn: { type: Function, required: true },
})
const emit = defineEmits(['imported'])
const { notify } = useNotify()
const files = ref([])
const loading = ref(false)
const hasPending = computed(() => files.value.some(entry => entry.status === 'pending'))
const hasFailure = computed(() => files.value.some(entry => entry.status === 'failed'))
const statusLabels = computed(() => ({
  pending: t('admin.import.queue.pending'),
  uploading: t('admin.import.queue.uploading'),
  success: t('admin.import.queue.success'),
  failed: t('admin.import.queue.failed'),
}))
let nextId = 0
let selectionGeneration = sessionGeneration()
let disposed = false
onBeforeUnmount(() => { disposed = true })
const { markBaseline } = useUnsavedChanges(
  () => files.value.filter(entry => entry.status !== 'success').map(entry => entry.file),
  { message: () => t('common.unsavedChanges') },
)
markBaseline([])

function resetChangedSession() {
  if (selectionGeneration === sessionGeneration()) return false
  files.value = []
  selectionGeneration = sessionGeneration()
  return true
}

// DropZone validates each file before it reaches the queue.
function handleFileSelect(file) {
  handleFilesSelect([file])
}
function handleFilesSelect(selected) {
  if (loading.value || disposed) return
  resetChangedSession()
  if (!props.multiple) files.value = []
  for (const file of selected) {
    if (files.value.some(entry => entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified)) continue
    files.value.push({ id: nextId++, file, status: 'pending', message: '' })
    if (!props.multiple) break
  }
}
function removeFile(entry) {
  if (loading.value) return
  files.value = files.value.filter(item => item.id !== entry.id)
}

async function upload() {
  if (loading.value || disposed || resetChangedSession()) return
  const pending = files.value.filter(entry => entry.status === 'pending')
  if (!pending.length) {
    notify(t('admin.import.noFile'), 'warning')
    return
  }
  const generation = sessionGeneration()
  const isCurrent = () => !disposed && generation === sessionGeneration()
  loading.value = true
  try {
    for (const entry of pending) {
      if (!isCurrent()) break
      entry.status = 'uploading'
      try {
        const data = await props.uploadFn(entry.file)
        if (!isCurrent()) break
        entry.status = 'success'
        entry.message = data?.message || t('admin.import.success')
        notify(entry.message, 'success')
        if (!props.multiple) files.value = []
        emit('imported')
      } catch (err) {
        if (!isCurrent()) break
        entry.status = 'failed'
        entry.message = err?.message || t('admin.import.failed')
        notify(`${entry.file.name}: ${entry.message}`, 'error')
        // A lost response can hide a committed import. Never replay this file;
        // keep remaining files pending for a deliberate separate submission.
        break
      }
    }
  } finally {
    loading.value = false
    if (!disposed) resetChangedSession()
  }
}
</script>
