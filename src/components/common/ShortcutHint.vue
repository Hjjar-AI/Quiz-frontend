<!-- frontend/src/components/common/ShortcutHint.vue -->
<template>
  <div v-if="!dismissed" ref="rootRef" class="shortcut-hint" aria-live="polite" aria-atomic="true">
    <BaseIconButton
      class="shortcut-hint__toggle"
      icon="bi bi-keyboard"
      size="small"
      :label="t('tests.shortcutToggle')"
      :aria-expanded="isOpen"
      @click.stop="toggle"
    >
    </BaseIconButton>
    <BasePopoverPanel :open="isOpen" panel-class="shortcut-hint__panel" transition="hint">
        <BaseIconButton
          class="shortcut-hint__dismiss"
          icon="bi bi-x-lg"
          :label="t('common.close')"
          size="small"
          @click="dismiss"
        />
        <div class="shortcut-hint__item">
          
          <kbd>1</kbd>–<kbd>{{ maxChoiceHint }}</kbd>
          <span>{{ t('tests.shortcutChoice') }}</span>
        </div>
        <div class="shortcut-hint__item">
          
          <kbd>{{ nextArrowGlyph }}</kbd> <span>{{ t('tests.shortcutNext') }}</span>
          <kbd>{{ prevArrowGlyph }}</kbd> <span>{{ t('tests.shortcutPrevious') }}</span>
        </div>
        <p class="shortcut-hint__item">{{ t('tests.shortcutScope') }}</p>
    </BasePopoverPanel>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useDirection } from '@/composables/useDirection'
import { FALLBACK_MAX_CHOICES } from '@/utils/constants'
import { useDropdown } from '@/composables/useDropdown'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import BasePopoverPanel from '@/components/base/BasePopoverPanel.vue'
import { storageService } from '@/services/storageService'


const { t } = useI18n()

const configStore = useConfigStore()
const { isRTL } = useDirection()

const { isOpen, rootRef, toggle } = useDropdown()
const dismissed = ref(storageService.getItem('shortcut_hint_dismissed') === 'true')

function dismiss() {
  dismissed.value = true
  storageService.setItem('shortcut_hint_dismissed', 'true')
}

const maxChoiceHint = computed(() => configStore.maxChoices || FALLBACK_MAX_CHOICES)

// Mirror of the flip in useTestNavigation.js:
//   LTR — ArrowRight = next, ArrowLeft = previous
//   RTL — ArrowRight = previous, ArrowLeft = next
const nextArrowGlyph = computed(() => (isRTL.value ? '←' : '→'))
const prevArrowGlyph = computed(() => (isRTL.value ? '→' : '←'))
</script>
