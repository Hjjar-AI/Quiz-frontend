<template>
  <Layout>
    <PageShell
      :title="t('preferences.title')"
      icon="bi bi-sliders"
      :subtitle="t('preferences.subtitle')"
      size="medium"
      page-class="settings-page preferences-page"
    >
      <template #actions>
        <BaseButton variant="secondary" icon="bi bi-arrow-counterclockwise" @click="resetOptions">
          {{ t('preferences.resetOptions') }}
        </BaseButton>
      </template>

      <p class="settings-notice">
        <i class="bi bi-lightning-charge" aria-hidden="true"></i>
        {{ t('preferences.appliesImmediately') }}
      </p>
      <nav class="settings-jump-links" :aria-label="t('preferences.sections')">
        <a href="#preferences-appearance">{{ t('preferences.appearance') }}</a>
        <a href="#preferences-browsing">{{ t('preferences.browsing') }}</a>
        <a href="#preferences-account">{{ t('preferences.account') }}</a>
      </nav>

      <BaseCard as="section" id="preferences-appearance" class="settings-card" :aria-label="t('preferences.appearance')">
        <SectionHeader :title="t('preferences.appearance')" :description="t('preferences.appearanceHint')" icon="bi bi-palette" />
        <FormGrid>
          <BaseSelect
            :model-value="themePreference"
            @update:model-value="applyTheme"
            :label="t('theme.label')"
            :hint="t('preferences.themeHint')"
            :options="themeOptions"
          />
          <BaseSelect
            :model-value="locale"
            @update:model-value="changeLanguage"
            :label="t('language.label')"
            :hint="t('preferences.languageHint')"
            :options="languageOptions"
          />
          <BaseSelect
            :model-value="fontPreference"
            @update:model-value="applyFont"
            :label="t('preferences.font')"
            :hint="t('preferences.fontHint')"
            :options="fontOptions"
          />
          <BaseSelect
            :model-value="prefs.density"
            @update:model-value="prefs.update('density', $event)"
            :label="t('preferences.density')"
            :hint="t('preferences.densityHint')"
            :options="densityOptions"
          />
        </FormGrid>
        <div class="settings-font-preview" :aria-label="t('preferences.fontPreview')">
          <p class="settings-font-preview__label">{{ t('preferences.fontPreview') }}</p>
          <p lang="ar" dir="rtl">العلم يبدأ بسؤال، والمعرفة تنمو بالممارسة.</p>
          <p lang="en" dir="ltr">Learning starts with a question. Practice builds knowledge. 0123456789</p>
        </div>
      </BaseCard>

      <BaseCard as="section" id="preferences-browsing" class="settings-card" :aria-label="t('preferences.browsing')">
        <SectionHeader :title="t('preferences.browsing')" :description="t('preferences.browsingHint')" icon="bi bi-funnel" />
        <FormGrid>
          <BaseSelect
            :model-value="prefs.defaultPerPage"
            @update:model-value="prefs.update('defaultPerPage', $event)"
            :label="t('preferences.defaultPerPage')"
            :hint="t('preferences.perPageHint')"
            :options="perPageOptions"
          />
          <BaseSelect
            :model-value="prefs.defaultDifficulty"
            @update:model-value="prefs.update('defaultDifficulty', $event)"
            :label="t('preferences.defaultDifficulty')"
            :hint="t('preferences.difficultyHint')"
            :options="difficultyOptions"
          />
        </FormGrid>
      </BaseCard>

      <BaseCard as="section" id="preferences-account" class="settings-card" :aria-label="t('preferences.account')">
        <SectionHeader :title="t('preferences.account')" :description="t('preferences.accountHint')" icon="bi bi-person-gear" />
        <div class="settings-links">
          <RouterLink class="settings-link" to="/profile"><i class="bi bi-person" aria-hidden="true"></i>{{ t('profile.title') }}</RouterLink>
          <RouterLink v-if="authStore.can('admin.settings')" class="settings-link" to="/admin/settings">
            <i class="bi bi-gear" aria-hidden="true"></i>{{ t('admin.settings.title') }}
          </RouterLink>
        </div>
      </BaseCard>
    </PageShell>
  </Layout>
</template>

<script setup>
import '@/assets/settings.css'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '@/components/common/Layout.vue'
import PageShell from '@/components/common/PageShell.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FormGrid from '@/components/common/FormGrid.vue'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import { useFont } from '@/composables/useFont'
import { useNotify } from '@/composables/useNotify'
import { setLocale } from '@/i18n'
import { useLocaleFormatters } from '@/i18n/helpers/format'
import { LOCALE_META, SUPPORTED_LOCALES } from '@/i18n/helpers/direction'
import { PER_PAGE_OPTIONS, DIFFICULTY_OPTIONS } from '@/utils/constants'

const { t, locale } = useI18n()
const prefs = usePreferencesStore()
const authStore = useAuthStore()
const { themePreference, applyTheme, THEME_OPTIONS } = useTheme()
const { fontPreference, applyFont, FONT_OPTIONS } = useFont()
const { notify } = useNotify()
const { formatNumber } = useLocaleFormatters()

const perPageOptions = computed(() => PER_PAGE_OPTIONS.map(value => ({ value, label: formatNumber(value) })))
const fontOptions = computed(() => FONT_OPTIONS.map(value => ({ value, label: t(`preferences.fontOptions.${value}`) })))
const themeOptions = computed(() => THEME_OPTIONS.map(value => ({ value, label: t(`theme.${value}`) })))
const languageOptions = SUPPORTED_LOCALES.map(value => ({ value, label: LOCALE_META[value].label }))
const difficultyOptions = computed(() => [
  { value: '', label: t('preferences.allDifficulties') },
  ...DIFFICULTY_OPTIONS.map(opt => ({ value: opt.value, label: t(opt.labelKey) })),
])
const densityOptions = computed(() => [
  { value: 'comfortable', label: t('preferences.densityComfortable') },
  { value: 'compact', label: t('preferences.densityCompact') },
])

function changeLanguage(next) {
  if (next === locale.value) return
  const applied = setLocale(next)
  const announcer = document.getElementById('a11y-announcer')
  if (announcer) announcer.textContent = t('a11y.languageChanged', { language: LOCALE_META[applied].label })
  notify(t('language.changed', { language: LOCALE_META[applied].label }), 'info')
}

function resetOptions() {
  prefs.resetDisplayOptions()
  notify(t('preferences.optionsReset'), 'success')
}
</script>
