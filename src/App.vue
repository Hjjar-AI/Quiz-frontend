<!-- frontend/src/App.vue -->
<template>
  <div id="app">
    
    <a href="#main-content" class="skip-link">{{ t('a11y.skipLink') }}</a>
    <Transition name="banner">
      <div v-if="!isOnline" ref="offlineBannerRef" class="offline-banner" role="status">
        <i class="bi bi-wifi-off" aria-hidden="true"></i>
        <span>{{ t('app.offline') }}</span>
      </div>
    </Transition>
    <div id="a11y-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    <ErrorBoundary>
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'page-fade'" mode="out-in" @after-enter="focusPage">
          <component :is="Component" :key="route.path" :is-navigating="isNavigating" @vue:mounted="focusPage" />
        </transition>
      </router-view>
    </ErrorBoundary>
    <ToastContainer />
    <AppDialogs />
    <ScrollToTop />
  </div>
</template>

<script setup>

import { ref, onErrorCaptured, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { isModalOpen } from '@/composables/useModalStack'

import { useOnline } from '@/composables/useOnline'
import { useElementHeightToken } from '@/composables/useElementHeightToken'
import { setNavigatingRef } from '@/router/guards'
import AppDialogs from '@/components/common/AppDialogs.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'

const { t } = useI18n()
const currentRoute = useRoute()
let focusedPath = null

async function focusPage() {
  const path = currentRoute.path
  if (focusedPath === path || currentRoute.hash) return
  await nextTick()
  if (currentRoute.path !== path || focusedPath === path || isModalOpen.value) return
  const target = document.querySelector('#main-content h1, #app h1')
    || document.getElementById('main-content')
  if (!target || !target.getClientRects().length || target.closest('[inert]')) return
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
  focusedPath = path
  // A focused heading announces itself; use the live region for the fallback.
  if (target.tagName !== 'H1') {
    const announcer = document.getElementById('a11y-announcer')
    if (announcer) announcer.textContent = t(currentRoute.meta.titleKey || 'app.name')
  }
}
const { isOnline } = useOnline()
const offlineBannerRef = ref(null)
useElementHeightToken(offlineBannerRef, '--offline-banner-height')
const isNavigating = ref(false)
setNavigatingRef(isNavigating)

onErrorCaptured((err) => {
  console.error('App-level error (ErrorBoundary may have failed):', err)
  return false
})
</script>
