<template>
  <BaseModal :is-open="isOpen" :title="t('categories.mergeButton')"
    :dismissable="!busy && !uncertain" @close="close">
    <p>{{ t('categories.mergeImpact', { name: source?.name || '' }) }}</p>
    <BaseSelect v-model="targetId" :label="t('categories.mergeTarget')"
      :options="options" :placeholder="t('categories.mergeChoose')"
      :disabled="busy || uncertain || needsReview" required />
    <FeedbackRegion :error="error" />
    <p v-if="uncertain" role="status">{{ t('categories.mergeUnknown') }}</p>
    <p v-if="saved" role="status">{{ t('categories.mergeSuccess') }}</p>
    <template #footer>
      <BaseButton v-if="uncertain || needsReview" variant="secondary" :disabled="busy" @click="refresh">
        {{ t('common.refresh') }}
      </BaseButton>
      <BaseButton v-if="uncertain" :disabled="busy" @click="submit">
        {{ t('categories.mergeRetry') }}
      </BaseButton>
      <BaseButton v-else variant="primary" :loading="busy"
        :disabled="busy || needsReview || !targetId || !source || saved" @click="submit">
        {{ t('categories.mergeConfirm') }}
      </BaseButton>
      <BaseButton variant="secondary" :disabled="busy || uncertain" @click="close">
        {{ t('common.close') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import { categoryService } from '@/services/categoryService'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import { sessionGeneration } from '@/services/api/sessionScope'
import { createOperationId } from '@/utils/operationId'

const { t } = useI18n()
const emit = defineEmits(['saved'])
const store = useCategoryStore(), auth = useAuthStore()
const isOpen = ref(false), busy = ref(false), uncertain = ref(false), needsReview = ref(false)
const error = ref(''), saved = ref(false), source = ref(null), targetId = ref('')
let pending = null, scope = sessionGeneration(), alive = true
const permitted = () => alive && scope === sessionGeneration() && auth.can('categories.manage')
const options = computed(() => store.items.filter(row => row.id !== source.value?.id)
  .map(row => ({ value: row.id, label: row.name })))

function open(row) {
  if (busy.value || uncertain.value || !auth.can('categories.manage')) return
  scope = sessionGeneration(); source.value = row; targetId.value = ''
  pending = null; error.value = ''; saved.value = false; needsReview.value = false; isOpen.value = true
}
function close() { if (!busy.value && !uncertain.value) isOpen.value = false }
function confirmSuccess(target) {
  const sourceId = pending.source_id
  store.ids = store.ids.filter(id => id !== sourceId)
  delete store.byId[sourceId]
  store.byId[target.id] = target
  if (store.currentItem?.id === sourceId) store.currentItem = null
  pending = null; uncertain.value = false; needsReview.value = false; saved.value = true; error.value = ''
  emit('saved')
}
async function submit() {
  if (!permitted() || busy.value || needsReview.value || saved.value) return
  if (!pending) {
    const target = store.items.find(row => row.id === Number(targetId.value))
    if (!source.value || !target || target.id === source.value.id) return
    pending = { source_id: source.value.id, target_id: target.id,
      expected_version: source.value.version, target_version: target.version, operation_id: createOperationId() }
  }
  busy.value = true; error.value = ''
  try {
    const result = await categoryService.merge(pending)
    if (permitted()) confirmSuccess(result)
  } catch (failure) {
    if (!permitted()) return
    error.value = failure.message
    const rejected = [400, 401, 403, 404, 409, 422, 429].includes(Number(failure.code))
    uncertain.value = !rejected
    needsReview.value = rejected && [404, 409].includes(Number(failure.code))
    if (rejected) pending = null
  } finally { busy.value = false }
}
async function refresh() {
  if (!permitted() || busy.value) return
  busy.value = true; error.value = ''
  try {
    if (uncertain.value && pending) {
      const receipt = await categoryService.mergeReceipt(pending.operation_id)
      if (!permitted()) return
      if (receipt.action !== 'category.merge' || receipt.target_id !== pending.target_id) throw new Error(t('categories.mergeUnknown'))
      if (!receipt.target_exists) {
        pending = null; uncertain.value = false; saved.value = true
        error.value = t('common.revisionTargetMissing'); emit('saved'); return
      }
      const rows = await categoryService.list()
      if (!permitted()) return
      const target = rows.items.find(row => row.id === receipt.target_id)
      if (!target) {
        pending = null; uncertain.value = false; saved.value = true
        error.value = t('common.revisionTargetMissing'); emit('saved'); return
      }
      confirmSuccess(target)
    } else {
      const rows = await categoryService.list()
      if (!permitted()) return
      store.byId = Object.fromEntries(rows.items.map(row => [row.id, row])); store.ids = rows.items.map(row => row.id)
      source.value = rows.items.find(row => row.id === source.value?.id) || null
      if (!rows.items.some(row => row.id === Number(targetId.value))) targetId.value = ''
      needsReview.value = false
      if (!source.value) error.value = t('common.revisionTargetMissing')
    }
  } catch (failure) { if (permitted()) error.value = failure.message }
  finally { busy.value = false }
}
const protectLeave = event => { if (busy.value || uncertain.value) { event.preventDefault(); event.returnValue = '' } }
window.addEventListener('beforeunload', protectLeave)
onBeforeRouteLeave(() => !busy.value && !uncertain.value)
onBeforeUnmount(() => { alive = false; window.removeEventListener('beforeunload', protectLeave) })
defineExpose({ open })
</script>
