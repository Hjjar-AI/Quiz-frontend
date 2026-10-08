<template>
  <Layout>
    <PageShell :title="t('questions.addTitle')" icon="bi bi-plus-circle" size="base" page-class="question-form-page" :error="questionStore.error || ''" @dismiss-feedback="questionStore.error = null">
      <FeedbackRegion v-if="imageError" :warning="`${t('questions.imageRecovery')} ${imageError}`" />
      <BaseButton v-if="imageError" variant="secondary" :loading="saving" @click="retryImage">{{ t('questions.retryImage') }}</BaseButton>
      <QuestionForm ref="questionFormRef" :loading="saving || questionStore.isLoading" :save-blocked="hasPendingImage" @save="save" />
    </PageShell>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
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
const { saving, imageError, hasPendingImage, save, retryImage } = useQuestionSaveFlow({
  persist: payload => questionStore.create(payload),
  formRef: questionFormRef,
  afterSave: () => router.push('/questions'),
  uploadFailureKey: 'questions.imageUploadFailed',
})
</script>
