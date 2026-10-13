<template>
  <div class="manual-export-questions">
    <ListSearchInput
      :model-value="search"
      :placeholder="t('admin.database.pdfQuestionSearch')"
      :aria-label="t('admin.database.pdfQuestionSearch')"
      @update:model-value="changeSearch"
      @search="load(1)"
    />
    <p class="text-muted">{{ t('admin.database.pdfManualHint') }}</p>
    <AsyncContent
      :loading="loading"
      :error="error"
      :empty="items.length === 0"
      :empty-title="t('admin.database.pdfNoMatches')"
      empty-reason="no-results"
      @retry="load(page)"
    >
      <EntityRow
        v-for="question in items"
        :key="question.id"
        :title="`#${question.id}`"
        :description="questionText(question)"
        :level="5"
      >
        <details v-if="displayQuestion(question).case?.stem || question.image_url || question.choices?.length">
          <summary>{{ t('admin.database.pdfQuestionPreview') }}</summary>
          <BidiText v-if="displayQuestion(question).case?.stem" as="p" :text="displayQuestion(question).case.stem" />
          <img v-if="question.image_url" :src="question.image_url" :alt="t('admin.database.pdfQuestionImage')" class="manual-export-questions__image">
          <ol><li v-for="(choice, index) in displayQuestion(question).choices || []" :key="index"><BidiText :text="choice" /></li></ol>
        </details>
        <template #actions>
          <BaseCheckbox
            :model-value="selectedIds.has(question.id)"
            :label="t('admin.database.pdfSelectQuestion', { id: question.id })"
            @update:model-value="toggle(question, $event)"
          />
        </template>
      </EntityRow>
    </AsyncContent>
    <BasePagination v-if="!loading && !error" :current="page" :total-pages="totalPages" @page-change="load" />

    <h5 aria-live="polite">{{ t('admin.database.pdfSelectedCount', { count: formatNumber(modelValue.length) }) }}</h5>
    <p v-if="!modelValue.length" class="text-muted">{{ t('admin.database.pdfChooseQuestions') }}</p>
    <EntityRow
      v-for="(question, index) in modelValue"
      :key="question.id"
      :title="`${formatNumber(index + 1)}. #${question.id}`"
      :description="question.question"
      :level="6"
    >
      <template #actions>
        <BaseIconButton icon="bi bi-arrow-up" :label="t('admin.database.pdfMoveUp')" :disabled="index === 0" @click="move(index, -1)" />
        <BaseIconButton icon="bi bi-arrow-down" :label="t('admin.database.pdfMoveDown')" :disabled="index === modelValue.length - 1" @click="move(index, 1)" />
        <BaseIconButton icon="bi bi-x-lg" :label="t('admin.database.pdfRemoveQuestion', { id: question.id })" @click="toggle(question, false)" />
      </template>
    </EntityRow>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ListSearchInput from '@/components/common/ListSearchInput.vue'
import AsyncContent from '@/components/common/AsyncContent.vue'
import EntityRow from '@/components/common/EntityRow.vue'
import BidiText from '@/components/common/BidiText.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BasePagination from '@/components/base/BasePagination.vue'
import { questionService } from '@/services/questionService'
import { localizedQuestion } from '@/utils/localizedQuestion'
import { useLocaleFormatters } from '@/i18n/helpers/format'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const { t, locale } = useI18n()
const { formatNumber } = useLocaleFormatters()
const search = ref('')
const items = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const selectedIds = computed(() => new Set(props.modelValue.map(question => question.id)))
let generation = 0

function displayQuestion(question) { return localizedQuestion(question, locale.value) }

function questionText(question) {
  return displayQuestion(question).question
}

function changeSearch(value) {
  search.value = value
  generation += 1
  items.value = []
  error.value = ''
  loading.value = true
  page.value = 1
  totalPages.value = 1
}

async function load(nextPage = 1) {
  const request = ++generation
  loading.value = true
  error.value = ''
  page.value = nextPage
  try {
    const result = await questionService.list({ search: search.value, page: nextPage, per_page: 10 })
    if (request !== generation) return
    items.value = result.items || []
    totalPages.value = result.total_pages || 1
  } catch (failure) {
    if (request === generation) error.value = failure?.message || t('notifications.questionsLoadFailed')
  } finally {
    if (request === generation) loading.value = false
  }
}

function toggle(question, selected) {
  if (!selected) {
    emit('update:modelValue', props.modelValue.filter(item => item.id !== question.id))
  } else if (!selectedIds.value.has(question.id)) {
    emit('update:modelValue', [...props.modelValue, { id: question.id, question: questionText(question) }])
  }
}

function move(index, delta) {
  const target = index + delta
  if (target < 0 || target >= props.modelValue.length) return
  const next = [...props.modelValue]
  ;[next[index], next[target]] = [next[target], next[index]]
  emit('update:modelValue', next)
}

onMounted(() => load(1))
onBeforeUnmount(() => { generation += 1 })
</script>

<style scoped>
.manual-export-questions__image {
  max-inline-size: 100%;
  max-block-size: 12rem;
  object-fit: contain;
}
</style>
