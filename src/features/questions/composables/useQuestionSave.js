// frontend/src/features/questions/composables/useQuestionSave.js
//
// Post-save image handling and recovery for question create/edit.

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRecentItems } from '@/composables/useRecentItems'
import { questionService } from '@/services/questionService'

export function useQuestionSave() {
  const { t } = useI18n()
  const { add: addRecentCategory } = useRecentItems('categories')
  const { add: addRecentTag } = useRecentItems('tags')

  /**
   * Read and remove the two image sentinel fields from `payload`.
   *
   * Mutates `payload` in place: the keys are deleted. That is what
   * the caller wants — the same object is passed straight into the
   * store's create/update call, and the API must not see these two
   * keys.
   *
   * @param {Object} payload
   * @returns {{ pendingImage: File|null, clearImage: boolean }}
   */
  function extractSentinels(payload) {
    const pendingImage = payload.__pending_image || null
    const clearImage = payload.__clear_image || false
    delete payload.__pending_image
    delete payload.__clear_image
    return { pendingImage, clearImage }
  }

  /**
   * Run the shared post-save steps.
   *
   * @param {Object} options
   * @param {number} options.questionId       id of the saved question
   * @param {{ pendingImage: File|null, clearImage: boolean }} options.sentinels
   *                                          the object returned by
   *                                          `extractSentinels`
   * @param {Object} options.payload          the same object passed
   *                                          to create/update; read
   *                                          for `category` and
   *                                          `tags` after the save
   * @param {string} options.uploadFailureKey i18n key for the image
   *                                          upload warning
   * @returns {Promise<string>} Image failure message, or an empty string.
   */
  async function finishSave({ questionId, sentinels, payload, uploadFailureKey }) {
    const { pendingImage, clearImage } = sentinels
    let imageError = ''

    // ── Image upload (best-effort) ────────────────────────────
    //
    // When `pendingImage` is null and `clearImage` is true, the
    // service layer sends a delete flag — see
    // `questionService.uploadImage`.
    if (pendingImage || clearImage) {
      try {
        await questionService.uploadImage(questionId, pendingImage)
      } catch (e) {
        imageError = e?.message || t(uploadFailureKey)
      }
    }

    // ── Recent-items bookkeeping ──────────────────────────────
    //
    // Category and tag lists are stored per-user; see
    // `useRecentItems`. Both calls are idempotent — re-adding an
    // existing value just moves it to the front of the list.
    if (payload.category) addRecentCategory(payload.category)
    if (payload.tags) {
      payload.tags.split(',').forEach(tag => {
        const trimmed = tag.trim()
        if (trimmed) addRecentTag(trimmed)
      })
    }
    return imageError
  }

  return { extractSentinels, finishSave }
}
/** Freeze the draft through text/image work, and retry only a failed image. */
export function useQuestionSaveFlow({ persist, formRef, afterSave, uploadFailureKey }) {
  const { extractSentinels, finishSave } = useQuestionSave()
  const saving = ref(false)
  const imageError = ref('')
  const recovery = ref(null)
  const hasPendingImage = computed(() => recovery.value !== null)

  async function completeImage() {
    imageError.value = await finishSave(recovery.value)
    if (imageError.value) return
    formRef.value?.markClean()
    await afterSave()
    recovery.value = null
  }

  async function save(payload) {
    if (saving.value || recovery.value) return
    saving.value = true
    try {
      const sentinels = extractSentinels(payload)
      const result = await persist(payload)
      if (!result) return
      recovery.value = { questionId: result.id, sentinels, payload, uploadFailureKey }
      await completeImage()
    } finally { saving.value = false }
  }

  async function retryImage() {
    if (saving.value || !recovery.value) return
    saving.value = true
    try { await completeImage() }
    finally { saving.value = false }
  }

  return { saving, imageError, hasPendingImage, save, retryImage }
}
