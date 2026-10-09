import { ref } from 'vue'
import { sessionGeneration } from '@/services/api/sessionScope'
export function useRevisionReview({ load, apply, allow }) {
  const scope=sessionGeneration()
  const permitted=()=>scope===sessionGeneration() && allow()
  const conflict=ref(false), latest=ref(null), busy=ref(false), error=ref('')
  async function refresh() {
    if(busy.value || !permitted()) return
    conflict.value=true; latest.value=null; error.value=''; busy.value=true
    const generation=sessionGeneration()
    try { const value=await load(); if(generation===sessionGeneration()) latest.value=value }
    catch(e) { if(generation===sessionGeneration()) error.value=e.message }
    finally { busy.value=false }
  }
  function resolve(keep) {
    if(busy.value || !latest.value || !permitted()) return
    apply(keep,latest.value); reset()
  }
  function reset() {conflict.value=false;latest.value=null;error.value=''}
  return {conflict,latest,busy,error,refresh,resolve,reset}
}
