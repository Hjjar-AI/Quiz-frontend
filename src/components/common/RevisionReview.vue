<template>
  <BaseCard role="status">
    <p>{{ t('common.revisionConflict') }}</p>
    <pre v-if="latest" class="revision-review__values">{{ latest }}</pre>
    <FeedbackRegion :error="error" />
    <BaseButton type="button" :loading="busy" @click="$emit('refresh')">{{ t('common.refresh') }}</BaseButton>
    <BaseButton type="button" :disabled="busy || !latest || !canKeep" @click="$emit('keep')">{{ t('common.keepDraft') }}</BaseButton>
    <BaseButton type="button" :disabled="busy || !latest" @click="$emit('use-server')">{{ t(missing ? 'common.prepareNewCreation' : 'common.useServer') }}</BaseButton>
  </BaseCard>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FeedbackRegion from '@/components/common/FeedbackRegion.vue'
defineProps({ latest: {type:String,default:''},busy:Boolean,error:String,missing:Boolean,canKeep:{type:Boolean,default:true} })
defineEmits(['refresh','keep','use-server'])
const { t }=useI18n()
</script>
<style scoped>
.revision-review__values { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
