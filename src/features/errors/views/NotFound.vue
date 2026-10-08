<!-- frontend/src/features/errors/views/NotFound.vue -->
<template>
  <Layout>
    <div class="not-found">
      <div class="not-found__content">
        <i class="bi bi-exclamation-octagon not-found__icon" aria-hidden="true"></i>
        <h1>{{ t('errors.404Title') }}</h1>
        <h2>{{ t('errors.404Heading') }}</h2>
        <p class="text-muted">{{ t('errors.404Message') }}</p>
        <BaseButton variant="primary" @click="router.push('/')">
          <i class="bi bi-house" aria-hidden="true"></i> {{ t('errors.backHome') }}
        </BaseButton>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Layout from '@/components/common/Layout.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
</script>
