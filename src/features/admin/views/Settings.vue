<template>
  <Layout>
    <PageShell
      :title="t('admin.settings.title')"
      :subtitle="t('admin.settings.subtitle')"
      icon="bi bi-gear"
      size="medium"
      page-class="settings-page admin-settings"
    >
      <nav class="settings-jump-links" :aria-label="t('admin.settings.sections')">
        <a href="#settings-general">{{ t('admin.settings.sectionGeneral') }}</a>
        <a href="#settings-exams">{{ t('admin.settings.sectionTests') }}</a>
        <a v-if="authStore.can('admin.settings')" href="#settings-connection">{{ t('admin.settings.connectionTitle') }}</a>
        <a v-if="authStore.can('admin.seed')" href="#settings-maintenance">{{ t('admin.settings.sectionOps') }}</a>
        <RouterLink to="/preferences">{{ t('preferences.title') }}</RouterLink>
      </nav>

      <AsyncContent :loading="isFetching" :error="!hasLoaded ? adminSettingsStore.error : ''" @retry="loadSettings">
        <form v-if="hasLoaded" id="admin-settings-form" class="settings-form" novalidate @submit.prevent="saveSettings">
          <FeedbackRegion :error="adminSettingsStore.error" @dismiss="adminSettingsStore.error = null" />
          <BaseCard as="section" id="settings-general" class="settings-card" :aria-label="t('admin.settings.sectionGeneral')">
            <SectionHeader :title="t('admin.settings.sectionGeneral')" :description="t('admin.settings.generalHint')" icon="bi bi-person-check" />
            <FormGrid>
              <BaseInput
                v-for="field in accountFields" :key="field"
                :model-value="settings[field]"
                @update:model-value="updateField(field, $event)"
                @blur="touch(field)"
                :id="`setting-${field}`"
                :name="field"
                type="number" :min="0" :step="1" required
                :disabled="isSaving"
                :label="t(`admin.settings.${field === 'default_expiry_days' ? 'expiryDays' : 'renewalDays'}`)"
                :hint="t(`admin.settings.${field === 'default_expiry_days' ? 'expiryDaysHint' : 'renewalDaysHint'}`)"
                :error="errors[field]"
              />
            </FormGrid>
          </BaseCard>

          <BaseCard as="section" id="settings-exams" class="settings-card" :aria-label="t('admin.settings.sectionTests')">
            <SectionHeader :title="t('admin.settings.sectionTests')" :description="t('admin.settings.examsHint')" icon="bi bi-stopwatch" />
            <FormGrid single-column>
              <BaseInput
                :model-value="settings.exam_duration_minutes"
                @update:model-value="updateField('exam_duration_minutes', $event)"
                @blur="touch('exam_duration_minutes')"
                id="setting-exam_duration_minutes" name="exam_duration_minutes"
                type="number" :min="1" :step="1" required
                :disabled="isSaving"
                :label="t('admin.settings.examDuration')"
                :hint="t('admin.settings.examDurationHint')"
                :error="errors.exam_duration_minutes"
              />
            </FormGrid>
          </BaseCard>

          <div class="settings-save-bar">
            <p class="settings-save-bar__status" role="status">{{ t(isDirty ? 'admin.settings.unsaved' : 'admin.settings.upToDate') }}</p>
            <div class="settings-save-bar__actions">
              <BaseButton variant="secondary" :disabled="!isDirty || isSaving" @click="discardChanges">{{ t('common.discard') }}</BaseButton>
              <BaseButton type="submit" icon="bi bi-check-lg" :loading="isSaving" :disabled="!isDirty || maintenanceBusy">{{ t('admin.settings.save') }}</BaseButton>
            </div>
          </div>
        </form>
      </AsyncContent>

      <BaseCard v-if="authStore.can('admin.settings')" as="section" id="settings-connection" class="settings-card" :aria-label="t('admin.settings.connectionTitle')">
        <SectionHeader :title="t('admin.settings.connectionTitle')" :description="t('admin.settings.connectionHint')" icon="bi bi-phone" />
        <form class="settings-form" novalidate @submit.prevent="exportConnection">
          <BaseInput :model-value="connectionAddress" @update:model-value="updateConnectionAddress" @blur="touchConnection('address')"
            id="connection-address" name="connection-address" type="url" dir="auto" autocomplete="off" required
            :label="t('admin.settings.connectionAddress')" :hint="t('admin.settings.connectionAddressHint')"
            :error="connectionErrors.address" :disabled="connectionExportBusy" />
          <FeedbackRegion :error="connectionExportError" @dismiss="connectionExportError = ''" />
          <BaseButton type="submit" variant="secondary" icon="bi bi-download" :loading="connectionExportBusy">
            {{ t('admin.settings.connectionExport') }}
          </BaseButton>
          <p v-if="connectionDownloadStarted" role="status">{{ t('admin.settings.connectionDownloadStarted') }}</p>
        </form>
      </BaseCard>

      <BaseCard v-if="authStore.can('admin.seed')" as="section" id="settings-maintenance" class="settings-card" :aria-label="t('admin.settings.sectionOps')">
        <SectionHeader :title="t('admin.settings.sectionOps')" :description="t('admin.settings.opsIntro')" icon="bi bi-tools" />
        <div class="settings-operations">
          <article class="settings-operation">
            <h3>{{ t('admin.settings.rankRefreshTitle') }}</h3>
            <p>{{ t('admin.settings.rankRefreshDesc') }}</p>
            <FeedbackRegion scope="section" :error="adminSettingsStore.rankRefreshError" @dismiss="adminSettingsStore.rankRefreshError = null" />
            <p v-if="adminSettingsStore.lastRankRefreshResult" class="settings-operation__result" role="status">
              {{ t('admin.settings.rankRefreshLast', { updated: formatNumber(adminSettingsStore.lastRankRefreshResult.updated), scanned: formatNumber(adminSettingsStore.lastRankRefreshResult.scanned) }) }}
            </p>
            <BaseButton variant="secondary" icon="bi bi-arrow-repeat" :loading="adminSettingsStore.isRankRefreshLoading" :disabled="isSaving || isFetching || maintenanceBusy" @click="handleRefreshRanks">
              {{ t('admin.settings.rankRefreshAction') }}
            </BaseButton>
          </article>
          <article class="settings-operation">
            <h3>{{ t('admin.settings.seedTitle') }}</h3>
            <p>{{ t('admin.settings.seedDesc') }}</p>
            <FeedbackRegion scope="section" :error="adminSettingsStore.seedQuestionsError" @dismiss="adminSettingsStore.seedQuestionsError = null" />
            <p v-if="adminSettingsStore.lastSeedResult" class="settings-operation__result" role="status">{{ t('admin.settings.seedDone') }}</p>
            <BaseButton variant="secondary" icon="bi bi-database-add" :loading="adminSettingsStore.isSeedQuestionsLoading" :disabled="isSaving || isFetching || maintenanceBusy" @click="handleSeedQuestions">
              {{ t('admin.settings.seedAction') }}
            </BaseButton>
          </article>
        </div>
      </BaseCard>
    </PageShell>
  </Layout>
</template>

<script setup>
import '@/assets/settings.css'
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/common/Layout.vue'
import PageShell from '@/components/common/PageShell.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import AsyncContent from '@/components/common/AsyncContent.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FormGrid from '@/components/common/FormGrid.vue'
import { useAdminSettingsStore } from '@/stores/adminSettingsStore'
import { useAuthStore } from '@/stores/authStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { useDialog } from '@/composables/useDialog'
import { useLocaleFormatters } from '@/i18n/helpers/format'
import { downloadBlob } from '@/utils/downloadFile'
import { normalizeServerAddress, exportServerConnection } from '@/utils/serverConnectionFile'

const { t, locale } = useI18n()
const { formatNumber } = useLocaleFormatters()
const adminSettingsStore = useAdminSettingsStore()
const authStore = useAuthStore()
const { confirm } = useDialog()
// Export address is independent of runtime settings and stays memory-only.
const connectionAddress = ref('')
const connectionExportBusy = ref(false)
const connectionExportError = ref('')
const connectionDownloadStarted = ref(false)
const { errors: connectionErrors, touch: touchConnection, revalidate: revalidateConnection, validateAll: validateConnection } = useFormValidation({
  address: () => normalizeServerAddress(connectionAddress.value) ? '' : t('admin.settings.connectionInvalid'),
})
watch(locale, () => revalidateConnection('address'))

function updateConnectionAddress(value) {
  connectionAddress.value = value
  connectionExportError.value = ''
  connectionDownloadStarted.value = false
  revalidateConnection('address')
}

function exportConnection() {
  if (!authStore.can('admin.settings') || connectionExportBusy.value) return
  if (!validateConnection()) {
    document.getElementById('connection-address')?.focus()
    return
  }
  connectionExportBusy.value = true
  connectionExportError.value = ''
  connectionDownloadStarted.value = false
  try {
    const content = exportServerConnection(connectionAddress.value)
    downloadBlob(new Blob([content], { type: 'application/json;charset=utf-8' }), 'mukhtabir-connection.json')
    // Browser download completion/cancellation cannot be observed by this helper.
    connectionDownloadStarted.value = true
  } catch {
    connectionExportError.value = t('admin.settings.connectionExportFailed')
  } finally {
    connectionExportBusy.value = false
  }
}

const accountFields = ['default_expiry_days', 'default_renewal_days']
const fields = [...accountFields, 'exam_duration_minutes']
const settings = ref(Object.fromEntries(fields.map(field => [field, ''])))
const savedSettings = ref(null)
const hasLoaded = ref(false)
const isFetching = ref(true)
const isSaving = ref(false)
const seedConfirmPending = ref(false)
const maintenanceBusy = computed(() => seedConfirmPending.value || adminSettingsStore.isRankRefreshLoading || adminSettingsStore.isSeedQuestionsLoading)
const { isDirty, markClean } = useUnsavedChanges(settings, { message: () => t('common.unsavedChanges') })

function fieldError(field) {
  const raw = settings.value[field]
  const value = Number(raw)
  const min = field === 'exam_duration_minutes' ? 1 : 0
  if (String(raw).trim() === '' || !Number.isSafeInteger(value) || value < min) {
    return t('admin.settings.integerRequired', { min: formatNumber(min) })
  }
  return ''
}
const { errors, touch, revalidate, validateAll, resetValidation } = useFormValidation(
  Object.fromEntries(fields.map(field => [field, () => fieldError(field)])),
)

watch(locale, () => fields.forEach(revalidate))

function updateField(field, value) {
  settings.value[field] = value === '' ? '' : Number(value)
  revalidate(field)
}

async function loadSettings() {
  if (isSaving.value || maintenanceBusy.value) return
  isFetching.value = true
  try {
    const data = await adminSettingsStore.fetchSettings()
    if (!data) return
    settings.value = Object.fromEntries(fields.map(field => [field, data[field] === '' || data[field] == null ? '' : Number(data[field])]))
    savedSettings.value = { ...settings.value }
    hasLoaded.value = true
    resetValidation()
    markClean()
  } finally {
    isFetching.value = false
  }
}

async function saveSettings() {
  if (!hasLoaded.value || !isDirty.value || isSaving.value || maintenanceBusy.value) return
  if (!validateAll()) {
    await nextTick()
    const invalidField = fields.find(field => errors[field])
    document.getElementById(`setting-${invalidField}`)?.focus()
    return
  }
  isSaving.value = true
  const payload = { ...settings.value }
  try {
    const result = await adminSettingsStore.updateSettings(payload)
    if (result === null) return
    savedSettings.value = payload
    resetValidation()
    markClean()
  } finally {
    isSaving.value = false
  }
}

function discardChanges() {
  if (isSaving.value || !savedSettings.value) return
  settings.value = { ...savedSettings.value }
  adminSettingsStore.error = null
  resetValidation()
  markClean()
}

function handleRefreshRanks() {
  if (!authStore.can('admin.seed') || isSaving.value || isFetching.value || maintenanceBusy.value) return
  adminSettingsStore.refreshAuthorRanks()
}

async function handleSeedQuestions() {
  if (!authStore.can('admin.seed') || isSaving.value || isFetching.value || maintenanceBusy.value) return
  seedConfirmPending.value = true
  try {
    if (await confirm(t('admin.settings.seedConfirm'), 'warning')) {
      if (authStore.can('admin.seed')) await adminSettingsStore.seedSampleQuestions()
    }
  } finally {
    seedConfirmPending.value = false
  }
}

onMounted(loadSettings)
</script>
