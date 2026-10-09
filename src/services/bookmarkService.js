import { apiClient } from '@/services/api/client'
import { ENDPOINTS } from '@/services/api/endpoints'

export const bookmarkService = {
  list() {
    return apiClient.get(ENDPOINTS.BOOKMARKS.BASE)
  },
  state(questionId) {
    return apiClient.get(ENDPOINTS.BOOKMARKS.TOGGLE(questionId))
  },
  set(questionId, added) {
    return apiClient.put(ENDPOINTS.BOOKMARKS.TOGGLE(questionId), { added })
  },
  toggle(questionId) {
    return apiClient.post(ENDPOINTS.BOOKMARKS.TOGGLE(questionId))
  },
  count() {
    return apiClient.get(ENDPOINTS.BOOKMARKS.COUNT)
  },
}