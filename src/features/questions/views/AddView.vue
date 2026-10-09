<template>
  <Layout>
    <PageShell :title="t('questions.addTitle')" icon="bi bi-plus-circle" size="base" page-class="question-form-page" :error="questionStore.error || ''" @dismiss-feedback="questionStore.error = null">
      <BaseButton v-if="!questionStore.recoveryLoaded" :loading="saving" @click="questionStore.hydrateWriteRecovery()">{{ t('common.retry') }}</BaseButton>
      <FeedbackRegion v-if="imageError" :warning="`${t('questions.imageRecovery')} ${imageError}`" />
      <BaseButton v-if="imageError" variant="secondary" :loading="saving" @click="retryImage">{{ t('questions.retryImage') }}</BaseButton>
      <BaseButton v-if="uncertainSave" variant="secondary" :loading="saving" @click="reviewWrite">{{ t('questions.reviewSave') }}</BaseButton>
      <BaseButton v-if="uncertainSave && questionStore.createReceiptMissing" variant="secondary" :loading="saving" @click="retryWrite">{{ t('questions.retrySameRequest') }}</BaseButton>
      <FeedbackRegion v-if="questionStore.restoredCreate" :warning="t('questions.restoredPendingSave')" />
      <BaseButton v-if="questionStore.restoredCreate" :loading="saving" @click="checkRestoredSave">{{ t('questions.reviewSave') }}</BaseButton>
      <BaseButton v-if="questionStore.restoredCreate && questionStore.createReceiptMissing" @click="discardRestoredSave">{{ t('questions.acknowledgePendingSave') }}</BaseButton>
      <BaseButton v-if="recoveredId" @click="router.push(`/questions/${recoveredId}`)">{{ t('questions.openRecoveredSave') }}</BaseButton>
      <QuestionForm ref="questionFormRef" :loading="saving || questionStore.isLoading" :save-blocked="hasPendingImage || uncertainSave || questionStore.restoredCreate || !questionStore.recoveryLoaded" @save="save" />
    </PageShell>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { questionService } from '@/services/questionService'
import { useDialog } from '@/composables/useDialog'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/common/Layout.vue'
import PageShell from '@/components/common/PageShell.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import QuestionForm from '../components/QuestionForm.vue'
import { useQuestionStore } from '@/stores/questionStore'
import { useQuestionSaveFlow } from '../composables/useQuestionSave'

const { t } = useI18n()
const router = useRouter()
const questionFormRef = ref(null)
const questionStore = useQuestionStore()
const recoveredId = ref(null)
const { confirm } = useDialog()
onMounted(() => questionStore.hydrateWriteRecovery())
async function checkRestoredSave() {
  if (saving.value || !questionStore.restoredCreate) return
  saving.value = true
  try {
    const result = await questionService.createReceipt(questionStore.pendingCreate)
    // Only expose the saved result; never apply a new form/image to an old save.
    recoveredId.value = result.id
    questionStore.pendingCreate = null; questionStore.restoredCreate = false
    questionStore.checkpointWrites()
  } catch(e) {
    questionStore.createReceiptMissing = Number(e?.code) === 404
    questionStore.error = e.message
  } finally { saving.value = false }
}
async function discardRestoredSave() {
  if(await confirm(t('questions.acknowledgePendingConfirm'))) questionStore.acknowledgeRestoredCreate()
}
const { saving, imageError, hasPendingImage, uncertainSave, reviewWrite, retryWrite, save, retryImage } = useQuestionSaveFlow({
  persist: (payload, retry = false) => questionStore.create(payload, retry),
  isUncertain: () => Boolean(questionStore.pendingCreate),
  formRef: questionFormRef,
  afterSave: () => router.push('/questions'),
  uploadFailureKey: 'questions.imageUploadFailed',
})
</script>
