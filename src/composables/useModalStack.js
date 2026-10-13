// frontend/src/composables/useModalStack.js
//
// Nested dialogs keep their opening order. CSS owns the base tier and gap,
// so changing stacking tokens also updates already-open dialogs.
// The computed expression is bound directly to BaseModal's overlay style.

import { ref, computed, onBeforeUnmount } from 'vue'

// Module-level stack. Insertion order = visual stacking order.
// Never exported; consumers go through `useModalStack()`.
const openStack = ref([])
export const isModalOpen = computed(() => openStack.value.length > 0)
let nextId = 0

export function useModalStack() {
  const id = ++nextId
  const isTopmost = computed(() => openStack.value.at(-1) === id)

  const zIndex = computed(() => {
    const idx = openStack.value.indexOf(id)
    return `calc(var(--z-modal-overlay) + ${Math.max(0, idx)} * var(--z-modal-step))`
  })

  function register() {
    if (!openStack.value.includes(id)) {
      // Assign a new array so the computed re-evaluates. Mutating
      // the existing array in place would be tracked by Vue's deep
      // reactive proxy, but a full reassignment keeps the identity
      // change obvious at every call site that reads the stack.
      openStack.value = [...openStack.value, id]
    }
  }

  function unregister() {
    const idx = openStack.value.indexOf(id)
    if (idx >= 0) {
      const next = [...openStack.value]
      next.splice(idx, 1)
      openStack.value = next
    }
  }

  onBeforeUnmount(() => {
    // Safety net: a modal that unmounts without emitting a close
    // (e.g. its parent route is torn down while it is still open)
    // would otherwise leave its id in the stack forever, skewing
    // the z-index of every modal opened afterwards.
    unregister()
  })

  return { zIndex, isTopmost, register, unregister }
}
