import { sessionGeneration } from '@/services/api/sessionScope'
// frontend/src/features/questions/composables/useQuestionSave.js
//
// Post-save image handling and recovery for question create/edit.

import { ref, computed, onBeforeUnmount } from 'vue'
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
    const generation=sessionGeneration()
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
    if(generation!==sessionGeneration()) return imageError
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
export function useQuestionSaveFlow({ persist, formRef, afterSave, uploadFailureKey, isUncertain = () => false }) {
  let alive=true
  onBeforeUnmount(()=>{alive=false})
  const scope=sessionGeneration()
  const { extractSentinels, finishSave } = useQuestionSave()
  const saving = ref(false)
  const imageError = ref('')
  const recovery = ref(null)
  const pendingWrite = ref(null)
  const uncertainSave = computed(() => pendingWrite.value !== null)
  const hasPendingImage = computed(() => recovery.value !== null)

  async function completeImage() {
    if(!alive || scope!==sessionGeneration()) return
    const generation=sessionGeneration()
    imageError.value = await finishSave(recovery.value)
    if(!alive || generation !== sessionGeneration()) return
    if (imageError.value) return
    formRef.value?.markClean()
    await afterSave()
    recovery.value = null
  }

  async function save(payload) {
    if (!alive || scope!==sessionGeneration() || saving.value || recovery.value || pendingWrite.value) return
    saving.value = true
    const generation=sessionGeneration()
    try {
      const sentinels = extractSentinels(payload)
      const result = await persist(payload)
      if(!alive || generation !== sessionGeneration()) return
      if (!result) {
        if (isUncertain()) pendingWrite.value = { sentinels, payload: { ...payload } }
        return
      }
      recovery.value = { questionId: result.id, sentinels, payload, uploadFailureKey }
      await completeImage()
    } finally { saving.value = false }
  }

  async function retryImage() {
    if (!alive || scope!==sessionGeneration() || saving.value || !recovery.value) return
    saving.value = true
    try { await completeImage() }
    finally { saving.value = false }
  }

  async function resolveWrite(retry) {
    if (!alive || scope!==sessionGeneration() || saving.value || !pendingWrite.value) return
    saving.value = true
    try {
      const original = pendingWrite.value
      const generation=sessionGeneration()
      const result = await persist(original.payload, retry)
      if(!alive || generation !== sessionGeneration()) return
      if (!result) return
      recovery.value = { questionId: result.id, sentinels: original.sentinels, payload: original.payload, uploadFailureKey }
      pendingWrite.value = null
      await completeImage()
    } finally { saving.value = false }
  }

  const reviewWrite = () => resolveWrite(false)
  const retryWrite = () => resolveWrite(true)
  return { saving, imageError, hasPendingImage, uncertainSave, reviewWrite, retryWrite, save, retryImage }
}
