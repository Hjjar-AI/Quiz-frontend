import { defineStore } from 'pinia'
import { tagService } from '@/services/tagService'
import { useCrudActions } from '@/composables/useCrudActions'
import {
  standardState,
  standardGetters,
  subResourceState,
  subResourceGetters,
  makeReset,
} from '@/stores/storeHelpers'

export const useTagStore = defineStore('tags', {
  state: () =>
    standardState({lastErrorCode:null,
      items: [],
      tree: [],
      treeVersion: null,
      ...subResourceState('tree'),
    }),

  getters: {
    ...standardGetters,
    ...subResourceGetters('tree'),
    names: (state) =>
      state.items.map((tag) => (typeof tag === 'string' ? tag : tag.name)).filter(Boolean),
  },

  actions: {
    async fetchList() {
      return await useCrudActions(this).wrap(() => tagService.list(), {
        errorMsgFallbackKey: 'notifications.tagsLoadFailed',
        suppressErrorToast: true,
        onSuccess: (res) => {
          this.items = res?.items || []
        },
      })
    },

    async fetchTree() {
      return await useCrudActions(this, {
        statusKey: 'treeStatus',
        errorKey: 'treeError',
      }).wrap(() => tagService.getTree(), {
        errorMsgFallbackKey: 'notifications.tagsLoadFailed',
        suppressErrorToast: true,
        onSuccess: (res) => {
          this.tree = res?.tree || []
          this.treeVersion = res?.version ?? null
        },
      })
    },

    async rename(oldName, newName, version) {
      const result = await useCrudActions(this).wrap(() => tagService.renameTag(oldName, newName, version), {
        errorMsgFallbackKey: 'admin.tags.renameFailed',
      })
      if (result == null || this.status !== 'success') return null
      await this.refresh()
      return result ?? true
    },

    async remove(name, version) {
      const result = await useCrudActions(this).wrap(() => tagService.deleteTag(name, version), {
        errorMsgFallbackKey: 'admin.tags.deleteFailed',
      })
      if (result == null || this.status !== 'success') return null
      await this.refresh()
      return result ?? true
    },

    async merge(sourceTags, targetTag, version) {
      const result = await useCrudActions(this).wrap(
        () => tagService.mergeTags(sourceTags, targetTag, version),
        { errorMsgFallbackKey: 'admin.tags.mergeFailed' },
      )
      if (result == null || this.status !== 'success') return null
      await this.refresh()
      return result ?? true
    },

    async refresh() {
      await this.fetchList()
      const treeResult = await this.fetchTree()
      if (!treeResult) {
        this.treeVersion = null
        this.tree = this.items.map((tag) => ({
          name: typeof tag === 'string' ? tag : tag.name,
          children: [],
        }))
      }
    },

    reset: makeReset({lastErrorCode:null,
      items: [],
      tree: [],
      treeVersion: null,
      status: 'idle',
      error: null,
      treeStatus: 'idle',
      treeError: null,
    }),
  },
})
