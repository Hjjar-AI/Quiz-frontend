<!-- frontend/src/components/layout/ThemeDropdown.vue -->
<template>
  <div ref="rootRef" class="theme-dropdown">
    <BaseButton
      variant="ghost"
      size="small"
      raw-content
      class="theme-dropdown__toggle"
      :aria-label="t('theme.label')"
      :title="t('theme.label')"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click.stop="toggle"
    >
      <i :class="currentThemeIcon" aria-hidden="true"></i>
      <i
        class="bi bi-chevron-down theme-dropdown__arrow"
        :class="{ 'theme-dropdown__arrow--open': isOpen }"
       aria-hidden="true"></i>
    </BaseButton>

    <BasePopoverPanel :open="isOpen" panel-class="theme-dropdown__menu">
      <section v-for="group in THEME_GROUPS" :key="group.key" class="theme-dropdown__group">
        <p class="theme-dropdown__group-label">{{ t(`theme.group.${group.key}`) }}</p>
        <BaseButton
          v-for="theme in group.themes"
          :key="theme"
          variant="ghost"
          size="small"
          raw-content
          class="theme-dropdown__item"
          :class="{ 'theme-dropdown__item--active': theme === themePreference }"
          :aria-pressed="theme === themePreference"
          @click="selectTheme(theme)"
        >
          <span class="theme-dropdown__swatch" :data-theme="previewTheme(theme)" aria-hidden="true">
            <span class="theme-dropdown__swatch-card"></span>
            <span class="theme-dropdown__swatch-primary"></span>
            <span class="theme-dropdown__swatch-text"></span>
          </span>
          <span class="theme-dropdown__item-label">{{ t(`theme.${theme}`) }}</span>
          <i v-if="theme === themePreference" class="bi bi-check2 theme-dropdown__item-check" aria-hidden="true"></i>
        </BaseButton>
      </section>
    </BasePopoverPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useDropdown } from '@/composables/useDropdown'
import BasePopoverPanel from '@/components/base/BasePopoverPanel.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const { t } = useI18n()
const { currentTheme, themePreference, applyTheme, THEME_GROUPS } = useTheme()
const { isOpen, rootRef, close, toggle } = useDropdown()

const themeIcons = {
  auto: 'bi bi-circle-half',
  stone: 'bi bi-gem',
  iris: 'bi bi-stars',
  blossom: 'bi bi-flower1',
  lagoon: 'bi bi-water',
  slate: 'bi bi-cloud-fill',
  ink: 'bi bi-pen-fill',
  amber: 'bi bi-sun-fill',
  'ruby': 'bi bi-diamond-fill',
  dark: 'bi bi-moon-fill',
  midnight: 'bi bi-moon-stars-fill',
  onyx: 'bi bi-circle-fill',
  contrast: 'bi bi-circle-half',
}

const currentThemeIcon = computed(() => themeIcons[themePreference.value] || 'bi bi-palette')

function previewTheme(theme) {
  return theme === 'auto' ? currentTheme.value : theme
}

function selectTheme(theme) {
  applyTheme(theme)
  close()
}
</script>
