import { ref, onMounted, onUnmounted } from 'vue'
import { useAsyncState } from './composableHelpers'

const MAX_CONSECUTIVE_ERRORS = 5
export function useAutoRefresh(fetchFn, intervalMs = 30000, immediate = true) {
  const lastUpdated=ref(null)
  const { status,setLoading,setSuccess,setError }=useAsyncState()
  const isRefreshing=ref(false)
  let intervalId=null, consecutiveErrors=0, currentInterval=intervalMs
  let generation=0, disposed=false, running=false, controller=null
  async function refresh() {
    if(disposed || isRefreshing.value) return
    const owner=generation
    const requestController=new AbortController();controller=requestController
    isRefreshing.value=true;setLoading()
    try {
      const result=await fetchFn({signal:requestController.signal,isCurrent:()=>!disposed && owner===generation})
      if(disposed || owner!==generation) return
      if(result===null) throw new Error('Refresh failed')
      lastUpdated.value=new Date();setSuccess();consecutiveErrors=0
      if(currentInterval!==intervalMs) {currentInterval=intervalMs;restartInterval()}
    } catch(error) {
      if(disposed || owner!==generation || error?.code==='CANCEL') return
      setError(error);consecutiveErrors++
      if(consecutiveErrors>=MAX_CONSECUTIVE_ERRORS) {stop();return}
      currentInterval=Math.min(intervalMs*2**consecutiveErrors,300000);restartInterval()
    } finally {
      if(owner===generation) {isRefreshing.value=false;controller=null}
    }
  }
  function restartInterval() {
    if(intervalId) clearInterval(intervalId)
    intervalId=null
    if(running && !disposed && !document.hidden) intervalId=setInterval(refresh,currentInterval)
  }
  function start() {
    if(disposed || running || document.hidden) return
    running=true;consecutiveErrors=0;currentInterval=intervalMs
    restartInterval();if(immediate) refresh()
  }
  function stop() {
    running=false;generation++;controller?.abort();controller=null;isRefreshing.value=false
    if(intervalId) clearInterval(intervalId)
    intervalId=null
  }
  function visibility() {if(document.hidden) stop();else start()}
  onMounted(()=>{start();document.addEventListener('visibilitychange',visibility)})
  onUnmounted(()=>{disposed=true;stop();document.removeEventListener('visibilitychange',visibility)})
  return {lastUpdated,isRefreshing,refresh,stop,start}
}