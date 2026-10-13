<template>
  <Layout>
    <PageShell :title="t('questions.editTitle')" icon="bi bi-pencil-square" size="base" page-class="question-form-page" :error="question ? questionStore.error || '' : ''" @dismiss-feedback="questionStore.error = null">
      <FeedbackRegion v-if="imageError" :warning="`${t('questions.imageRecovery')} ${imageError}`" />
      <BaseButton v-if="imageError" variant="secondary" :loading="saving" @click="retryImage">{{ t('questions.retryImage') }}</BaseButton>
      <AsyncContent :loading="loadingQuestion" :error="loadError" @retry="loadQuestion">
        <QuestionForm v-if="question" ref="questionFormRef" :question="question" :loading="saving || questionStore.isLoading" :save-blocked="hasPendingImage" @save="save" />
      </AsyncContent>
    </PageShell>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/common/Layout.vue'
import PageShell from '@/components/common/PageShell.vue'
import AsyncContent from '@/components/common/AsyncContent.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import QuestionForm from '../components/QuestionForm.vue'
import { useQuestionStore } from '@/stores/questionStore'
import { questionService } from '@/services/questionService'
import { useAuthStore } from '@/stores/authStore'
import { useNotify } from '@/composables/useNotify'
import { useQuestionSaveFlow } from '../composables/useQuestionSave'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const questionStore = useQuestionStore()
const authStore = useAuthStore()
const { notify } = useNotify()
const question = ref(null)
const questionFormRef = ref(null)
const loadingQuestion = ref(false)
const loadError = ref('')
let disposed = false

async function loadQuestion() {
  if (loadingQuestion.value) return
  const id = Number(route.params.id)
  if (!Number.isSafeInteger(id) || id < 1) {
    notify(t('questions.invalidId'), 'error')
    router.replace('/questions')
    return
  }
  loadingQuestion.value = true
  loadError.value = ''
  try {
    const data = await questionService.get(id)
    if (disposed) return
    question.value = data
    questionStore.rememberLastViewed(id, authStore.user?.id || 'guest')
  } catch (error) {
    if (disposed) return
    if (error?.code === 404) {
      notify(t('questions.notFound'), 'error')
      router.replace('/questions')
    } else if (error?.code !== 'CANCEL') {
      loadError.value = error?.message || t('notifications.questionFetchFailed')
    }
  } finally { loadingQuestion.value = false }
}

const { saving, imageError, hasPendingImage, save, retryImage } = useQuestionSaveFlow({
  persist: payload => {
    if (question.value?.version !== undefined) payload.expected_version = question.value.version
    return questionStore.update(question.value.id, payload)
  },
  formRef: questionFormRef,
  afterSave: () => router.push('/questions'),
  uploadFailureKey: 'questions.imageUploadFailedUpdate',
})
onMounted(loadQuestion)
onBeforeUnmount(() => { disposed = true })
</script>
