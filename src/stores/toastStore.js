import { defineStore } from 'pinia'
import { standardState, standardGetters } from '@/stores/storeHelpers'

const MAX_VISIBLE_TOASTS = 5
const timers = new Map()

function schedule(store, id, entry) {
  if (entry.pauses.size) return
  entry.started = Date.now()
  entry.timer = setTimeout(() => store.removeToast(id), entry.remaining)
}

export const useToastStore = defineStore('toast', {
  state: () => standardState({ toasts: [], nextId: 1 }),
  getters: { ...standardGetters },
  actions: {
    addToast(message, type = 'info', duration = type === 'error' ? 0 : 8000) {
      const existing = this.toasts.find(toast => toast.message === message && toast.type === type)
      const id = existing?.id ?? this.nextId++
      const previous = timers.get(id)
      clearTimeout(previous?.timer)
      timers.delete(id)
      if (!existing) {
        // Do not discard persistent errors or a notification being read.
        if (this.toasts.length >= MAX_VISIBLE_TOASTS) {
          const disposable = this.toasts.find(toast => timers.has(toast.id) && !timers.get(toast.id).pauses.size)
          if (disposable) this.removeToast(disposable.id)
        }
        this.toasts.push({ id, message, type })
      }
      if (duration > 0) {
        const entry = { remaining: duration, started: 0, timer: null, pauses: previous?.pauses ?? new Set() }
        timers.set(id, entry)
        schedule(this, id, entry)
      }
      return id
    },
    pauseToast(id, reason) {
      const entry = timers.get(id)
      if (!entry || entry.pauses.has(reason)) return
      if (!entry.pauses.size) {
        clearTimeout(entry.timer)
        entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.started))
      }
      entry.pauses.add(reason)
    },
    resumeToast(id, reason) {
      const entry = timers.get(id)
      if (!entry || !entry.pauses.delete(reason) || entry.pauses.size) return
      schedule(this, id, entry)
    },
    removeToast(id) {
      clearTimeout(timers.get(id)?.timer)
      timers.delete(id)
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index !== -1) this.toasts.splice(index, 1)
    },
    reset() {
      for (const entry of timers.values()) clearTimeout(entry.timer)
      timers.clear()
      this.toasts = []
      this.status = 'idle'
      this.error = null
    },
  },
})