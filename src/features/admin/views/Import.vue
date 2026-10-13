<!-- frontend/src/features/admin/views/Import.vue -->
<template>
  <Layout>
    <PageShell
      :title="t('admin.import.title')"
      icon="bi bi-upload"
      size="medium"
      page-class="import-page"
    >
      <BaseCard>
        <ImportLimitUnlock />
        <TabStrip
          v-model="activeTab"
          variant="pills"
          :tabs="tabs"
          :aria-label="t('admin.import.title')"
        />

        <FileImport v-show="activeTab === 'file'" />
        <TelegramImport v-if="activeTab === 'telegram'" />
        <StateImport v-else-if="activeTab === 'state'" @imported="handleStateImported" />
      </BaseCard>
    </PageShell>
  </Layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/common/Layout.vue'
import PageShell from '@/components/common/PageShell.vue'
import TabStrip from '@/components/common/TabStrip.vue'
import ImportLimitUnlock from '../components/ImportLimitUnlock.vue'
import FileImport from '../components/FileImport.vue'
import TelegramImport from '../components/TelegramImport.vue'
import StateImport from '../components/StateImport.vue'

const { t } = useI18n()
const router = useRouter()

const activeTab = ref('file')

const tabs = computed(() => [
  { key: 'file', label: t('admin.import.tabFile'), icon: 'bi bi-file-earmark' },
  { key: 'telegram', label: t('admin.import.tabTelegram'), icon: 'bi bi-telegram' },
  { key: 'state', label: t('admin.import.tabState'), icon: 'bi bi-box-seam' },
])

function handleStateImported() {
  // Route back to the questions list so the admin immediately sees
  // what was imported. The list fetches fresh on mount.
  router.push('/questions')
}
</script>
