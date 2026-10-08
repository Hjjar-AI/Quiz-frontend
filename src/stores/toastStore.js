import { defineStore } from 'pinia'
import { standardState, standardGetters } from '@/stores/storeHelpers'

const MAX_VISIBLE_TOASTS = 5
const timers = new Map()

export const useToastStore = defineStore('toast', {
  state: () => standardState({ toasts: [], nextId: 1 }),
  getters: { ...standardGetters },
  actions: {
    addToast(message, type = 'info', duration = 4000) {
      const existing = this.toasts.find(toast => toast.message === message && toast.type === type)
      const id = existing?.id ?? this.nextId++
      clearTimeout(timers.get(id))
      timers.delete(id)
      if (!existing) {
        while (this.toasts.length >= MAX_VISIBLE_TOASTS) this.removeToast(this.toasts[0].id)
        this.toasts.push({ id, message, type })
      }
      if (duration > 0) timers.set(id, setTimeout(() => this.removeToast(id), duration))
      return id
    },
    removeToast(id) {
      clearTimeout(timers.get(id))
      timers.delete(id)
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index !== -1) this.toasts.splice(index, 1)
    },
    reset() {
      for (const id of timers.keys()) clearTimeout(timers.get(id))
      timers.clear()
      this.toasts = []
      this.status = 'idle'
      this.error = null
    },
  },
})