<!-- frontend/src/features/admin/components/TagTreeNode.vue -->

<template>
  <li>
    <div class="tag-node">
      <span
        v-if="hasChildren"
        class="tag-toggle"
        role="button"
        tabindex="0"
        :aria-expanded="expanded"
        :aria-label="expanded ? t('admin.tags.collapseBranches') : t('admin.tags.expandBranches')"
        @click="expanded = !expanded"
        @keydown.enter.prevent="expanded = !expanded"
        @keydown.space.prevent="expanded = !expanded"
      >
        <i v-if="expanded" class="bi bi-chevron-down" aria-hidden="true"></i>
        <DirectionalIcon
          v-else
          ltr="bi bi-chevron-right"
          rtl="bi bi-chevron-left"
        />
      </span>
      <span v-else class="tag-toggle tag-toggle--empty" aria-hidden="true"></span>

      <BaseCheckbox
        :model-value="isSelected"
        :disabled="disabled"
        :label="node.name"
        @update:model-value="$emit('toggle-select', node.name)"
      />

      <span class="tag-actions">
        <BaseIconButton icon="bi bi-shuffle" size="small" :disabled="disabled"
          :label="t('admin.tags.mergeOne')" @click.stop="$emit('merge', node)" />
        <BaseIconButton
          icon="bi bi-pencil"
          :disabled="disabled"
          size="small"
          :title="t('admin.tags.rename')"
          :label="t('admin.tags.renameAria')"
          @click.stop="$emit('rename', node)"
        />
        <BaseIconButton
          icon="bi bi-trash"
          :disabled="disabled"
          variant="danger"
          size="small"
          :title="t('admin.tags.delete')"
          :label="t('admin.tags.deleteAria')"
          @click.stop="$emit('delete', node)"
        />
      </span>
    </div>

    <ul v-if="expanded && hasChildren" class="tag-children">
      <TagTreeNode
        v-for="child in node.children"
        :key="child.name"
        :node="child"
        :selected-names="selectedNames"
        :disabled="disabled"
        @merge="$emit('merge', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
        @toggle-select="$emit('toggle-select', $event)"
      />
    </ul>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'

const { t } = useI18n()

const props = defineProps({
  node: { type: Object, required: true },

  selectedNames: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

defineEmits(['rename', 'delete', 'merge', 'toggle-select'])

const expanded = ref(true)

const hasChildren = computed(
  () => Array.isArray(props.node.children) && props.node.children.length > 0
)

const isSelected = computed(() => props.selectedNames.includes(props.node.name))
</script>
