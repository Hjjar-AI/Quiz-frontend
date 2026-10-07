import { defineStore } from 'pinia'
import { knowledgeService } from '@/services/knowledgeService'
import { useCrudActions } from '@/composables/useCrudActions'
import {
  standardState,
  standardGetters,
  subResourceState,
  subResourceGetters,
  makeReset,
} from '@/stores/storeHelpers'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () =>
    standardState({
      items: [],
      mapPayload: null,
      ...subResourceState('map'),
      ...subResourceState('create'),
    }),

  getters: {
    ...standardGetters,
    ...subResourceGetters('map'),
    ...subResourceGetters('create'),
  },

  actions: {
    async fetchMap() {
      return await useCrudActions(this, {
        statusKey: 'mapStatus',
        errorKey: 'mapError',
      }).wrap(() => knowledgeService.map(), {
        errorMsgFallbackKey: 'knowledge.loadFailed',
        suppressErrorToast: true,
        onSuccess: (data) => {
          this.mapPayload = data
        },
      })
    },

    async fetchList(params = {}) {
      return await useCrudActions(this).wrap(() => knowledgeService.list(params), {
        errorMsgFallbackKey: 'common.loadFailed',
        suppressErrorToast: true,
        onSuccess: (data) => {
          this.items = data?.items || []
        },
      })
    },

    async create(data) {
      return await useCrudActions(this, {
        statusKey: 'createStatus',
        errorKey: 'createError',
      }).wrap(() => knowledgeService.create(data), {
        errorMsgFallbackKey: 'questions.knowledgeObjectCreateFailed',
        suppressErrorToast: true,
        onSuccess: (created) => {
          this.items = [...this.items, created].sort((left, right) =>
            String(left?.title || '').localeCompare(String(right?.title || '')),
          )
        },
      })
    },

    reset: makeReset({
      items: [],
      mapPayload: null,
      mapStatus: 'idle',
      mapError: null,
      createStatus: 'idle',
      createError: null,
      status: 'idle',
      error: null,
    }),
  },
})
