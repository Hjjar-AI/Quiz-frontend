<!-- frontend/src/features/masterExams/views/MasterExamDrafts.vue -->
<template>
  <Layout>
    <PageShell
      :title="t('masterExams.draftsTitle')"
      icon="bi bi-journal-text"
      :subtitle="t('masterExams.draftsEmptyHint')"
      page-class="master-exam-drafts-page"
    >
        <template #badges>
          <BaseBadge variant="warning"
            >{{ masterExamStore.draftsTotal }} {{ t('masterExams.draftBadge') }}</BaseBadge
          >
        </template>
        <template #actions>
          <BaseButton variant="secondary" @click="router.push('/master-exams')">
            <DirectionalIcon ltr="bi bi-arrow-left" rtl="bi bi-arrow-right" />
            {{ t('common.back') }}
          </BaseButton>
        </template>
      <ListToolbar :aria-label="t('masterExams.draftsTitle')">
        <template #search>
          <ListSearchInput
            v-model="searchInput"
            :placeholder="t('masterExams.draftsSearchPlaceholder')"
            @search="load"
          />
        </template>
        <template #filters>
          <BaseChip interactive :active="usage === ''" @click="setUsage('')">
            {{ t('masterExams.draftsFilterAll') }}
          </BaseChip>
          <BaseChip interactive :active="usage === 'orphan'" @click="setUsage('orphan')">
            {{ t('masterExams.draftsFilterOrphan') }}
          </BaseChip>
          <BaseChip interactive :active="usage === 'attached'" @click="setUsage('attached')">
            {{ t('masterExams.draftsFilterAttached') }}
          </BaseChip>
        </template>
      </ListToolbar>

      <AlertBox v-if="masterExamStore.draftWriteReview" variant="warning" :message="t('masterExams.draftWriteReview')" />
      <AlertBox v-if="masterExamStore.draftWriteError" variant="warning" :message="masterExamStore.draftWriteError" />
      <template v-if="masterExamStore.draftWriteReview">
        <BaseButton :disabled="draftBusy" @click="masterExamStore.readDraftForReview()">{{ t('questions.reviewSave') }}</BaseButton>
        <AlertBox v-if="masterExamStore.draftReadError" variant="warning" :message="masterExamStore.draftReadError" />
        <template v-if="masterExamStore.draftWriteReview.latest">
          <DraftQuestionForm
            :model-value="formFromDraft(masterExamStore.draftWriteReview.latest)"
            :categories="categoryStore.items" :cases="availableCases"
            :read-only="true" :submit-label="t('common.useServer')"
            case-list-id="draft-review-case-suggestions" correct-answer-name="draft-review-correct-answer"
          />
          <BaseButton :disabled="draftBusy" @click="acceptDraftReview(false)">{{ t('common.useServer') }}</BaseButton>
          <BaseButton v-if="masterExamStore.draftWriteReview.data" :disabled="draftBusy" @click="acceptDraftReview(true)">{{ t('common.keepDraft') }}</BaseButton>
        </template>
        <BaseButton :disabled="draftBusy" @click="masterExamStore.clearDraftReview()">{{ t('common.discard') }}</BaseButton>
      </template>

      <BaseListContainer
        :loading="masterExamStore.isDraftsLoading"
        :error="masterExamStore.draftsError"
        :items="masterExamStore.drafts"
        :empty-title="t('masterExams.draftsEmpty')"
        :empty-message="t('masterExams.draftsEmptyHint')"
        empty-icon="bi-journal-x"
        :empty-reason="searchInput || usage ? 'filtered' : 'first-use'"
        @retry="load"
      >
        <template #emptyActions>
          <BaseButton variant="primary" @click="router.push('/master-exams/new')">
            <i class="bi bi-plus-circle" aria-hidden="true"></i> {{ t('masterExams.draftsStartNew') }}
          </BaseButton>
        </template>
        <template #default="{ items }">
          <div class="master-exam-drafts-list stagger-list">
            <div v-for="draft in items" :key="draft.id" class="master-exam-draft-item">
              <div class="master-exam-draft-item__body">
                <p class="master-exam-draft-item__text">{{ draft.question }}</p>
                <div class="master-exam-draft-item__meta">
                  <span>
                    <i class="bi bi-list-ol" aria-hidden="true"></i>
                    {{ t('masterExams.draftChoicesCount', { n: draft.choices?.length || 0 }) }}
                  </span>
                  <span>
                    <i class="bi bi-check-circle" aria-hidden="true"></i>
                    {{ t('masterExams.draftCorrectAnswer', { n: draft.correct_answer }) }}
                  </span>
                  <span>
                    <i class="bi bi-speedometer" aria-hidden="true"></i> {{ difficultyLabel(draft.difficulty) }}
                  </span>
                  <span v-if="draft.category_name">
                    <i class="bi bi-folder2" aria-hidden="true"></i> {{ draft.category_name }}
                  </span>
                  <span v-if="draft.case" :title="draft.case.title || draft.case.key">
                    <i class="bi bi-journal-medical" aria-hidden="true"></i>
                    {{ draft.case.key }}
                  </span>
                  <span> <i class="bi bi-calendar" aria-hidden="true"></i> {{ formatDate(draft.created_at) }} </span>
                </div>
              </div>
              <div class="master-exam-draft-item__actions">
                <BaseButton variant="secondary" size="small" :disabled="draftBusy || Boolean(masterExamStore.draftWriteReview)" @click="openEdit(draft)">
                  <i class="bi bi-pencil" aria-hidden="true"></i> {{ t('masterExams.edit') }}
                </BaseButton>
                <BaseIconButton
                  icon="bi bi-trash"
                  variant="danger"
                  size="small"
                  :label="t('common.delete')"
                  :disabled="draftBusy || Boolean(masterExamStore.draftWriteReview)"
                  @click="handleDelete(draft)"
                />
              </div>
            </div>
          </div>
        </template>
      </BaseListContainer>
    </PageShell>

    <BaseModal
      :is-open="editModalOpen"
      :title="t('masterExams.draftEditTitle')"
      size="lg"
      @update:is-open="!draftBusy && (editModalOpen = false)"
    >
      <AlertBox v-if="masterExamStore.draftWriteError" variant="warning" :message="masterExamStore.draftWriteError" />
      <DraftQuestionForm
        v-model="editForm"
        :categories="categoryStore.items"
        :cases="availableCases"
        :loading="draftBusy || Boolean(masterExamStore.draftWriteReview)"
        :submit-label="t('common.save')"
        @submit="submitEdit"
        @cancel="!draftBusy && (editModalOpen = false)"
      />
    </BaseModal>
  </Layout>
</template>

<script setup>
import '@/assets/master.css'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '@/components/common/Layout.vue'
import PageShell from '@/components/common/PageShell.vue'
import BaseListContainer from '@/components/base/BaseListContainer.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import AlertBox from '@/components/common/AlertBox.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import ListToolbar from '@/components/common/ListToolbar.vue'
import ListSearchInput from '@/components/common/ListSearchInput.vue'
import DraftQuestionForm from '../components/DraftQuestionForm.vue'
import { useMasterExamStore } from '@/stores/masterExamStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCaseStore } from '@/stores/caseStore'
import { useDialog } from '@/composables/useDialog'
import { formatDate } from '@/utils/formatters'
import { difficultyLabelFor } from '@/utils/constants'
import { normalizeQuestionChoices } from '@/utils/questionValidators'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const masterExamStore = useMasterExamStore()
const categoryStore = useCategoryStore()
const caseStore = useCaseStore()
const { confirm } = useDialog()

const searchInput = ref(String(route.query.search || masterExamStore.draftsSearch || ''))
const usage = ref(String(route.query.usage || masterExamStore.draftsUsageFilter || ''))
const availableCases = computed(() => caseStore.items)
const draftBusy = computed(() => masterExamStore.draftWriteStatus === 'loading' || masterExamStore.draftReadStatus === 'loading')

// Shared difficulty-registry lookup. The previous local function
// duplicated the same easy/medium/hard key map that already lives
// in `utils/constants.js`.
function difficultyLabel(d) {
  return difficultyLabelFor(d, t)
}

async function load() {
  masterExamStore.setDraftsSearch(searchInput.value)
  masterExamStore.setDraftsUsageFilter(usage.value)
  const params = {}
  if (searchInput.value.trim()) params.search = searchInput.value.trim()
  if (usage.value) params.usage = usage.value
  await masterExamStore.fetchDrafts(params)
}

function setUsage(u) {
  usage.value = u
  load()
}

watch([searchInput, usage], () => {
  const query = {}
  if (searchInput.value.trim()) query.search = searchInput.value.trim()
  if (usage.value) query.usage = usage.value
  router.replace({ query })
})

const editModalOpen = ref(false)
const editForm = ref({
  id: null,
  question: '',
  choices: [],
  correct_answer: 1,
  explanation: '',
  source: '',
  difficulty: 'medium',
  category: null,
  case_key: '',
})

function formFromDraft(draft) {
  return {
    id: draft.id,
    expected_version: draft.version,
    question: draft.question,
    choices: [...(draft.choices || [])],
    correct_answer: draft.correct_answer,
    explanation: draft.explanation || '',
    source: draft.source || '',
    difficulty: draft.difficulty || 'medium',
    category: draft.category || null,
    case_key: draft.case?.key || '',
  }
}

function openEdit(draft) {
  if (draftBusy.value || masterExamStore.draftWriteReview) return
  editForm.value = formFromDraft(draft)
  editModalOpen.value = true
}

function acceptDraftReview(keep) {
  const review = masterExamStore.draftWriteReview
  if (draftBusy.value || !review?.latest) return
  editForm.value = keep
    ? { ...review.data, id: review.id, expected_version: review.latest.version }
    : formFromDraft(review.latest)
  masterExamStore.clearDraftReview()
  editModalOpen.value = true
}

async function submitEdit() {
  if (draftBusy.value || masterExamStore.draftWriteReview) return
  if (!editForm.value.question.trim()) return

  const { choices: filteredChoices, correctAnswer: remappedCorrectAnswer } =
    normalizeQuestionChoices(editForm.value.choices, editForm.value.correct_answer)

  if (filteredChoices.length < 2) return
  if (remappedCorrectAnswer === null) return

  const payload = {
    expected_version: editForm.value.expected_version,
    question: editForm.value.question.trim(),
    choices: filteredChoices,
    correct_answer: remappedCorrectAnswer,
    explanation: editForm.value.explanation,
    source: editForm.value.source,
    difficulty: editForm.value.difficulty,
    category: editForm.value.category,
    case_key: editForm.value.case_key || null,
  }
  const result = await masterExamStore.updateDraft(editForm.value.id, payload)
  if (result || masterExamStore.draftWriteReview) editModalOpen.value = false
}

async function handleDelete(draft) {
  if (draftBusy.value || masterExamStore.draftWriteReview) return
  if (!(await confirm(t('masterExams.draftDeleteConfirm')))) return
  await masterExamStore.deleteDraft(draft.id, draft.version)
}

onMounted(async () => {
  await categoryStore.fetchAll()
  await load()
  await caseStore.fetchList({ limit: 100 })
})
</script>
