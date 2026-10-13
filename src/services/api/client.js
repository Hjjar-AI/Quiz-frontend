import { sessionGeneration, onSessionScopeChange, sessionCancelled } from './sessionScope'
// frontend/src/services/api/client.js
import axios from 'axios'
import { API_BASE, ENDPOINTS } from './endpoints'
import { normalizeError } from './errorHandler'
import { i18n } from '@/i18n'
import {
  getCsrfToken,
  getCsrfPromise,
  getCsrfGeneration,
  setCsrfPromise,
  setCsrfToken,
  clearCsrfToken,
} from './csrfTokenStore'

const client = axios.create({
  baseURL: API_BASE + '/',
  withCredentials: true,
  timeout: 30000,
})

const pendingRequests = new Map()
const activeControllers = new Set()
onSessionScopeChange(() => { for (const controller of activeControllers) controller.abort(); activeControllers.clear(); pendingRequests.clear() })
const staleSession = config => config?.sessionGeneration != null && config.sessionGeneration !== sessionGeneration()
let sessionExpiryPromise = null
let sessionExpiryGeneration = null

async function fetchCsrfToken() {
  try {
    const response = await client.get(ENDPOINTS.AUTH.CSRF, { skipCsrf: true })
    return response.token
  } catch (err) {
    console.warn('Failed to fetch CSRF token:', err)
    return null
  }
}

function ensureCsrfToken() {
  const cached = getCsrfToken()
  if (cached) return Promise.resolve(cached)

  const pending = getCsrfPromise()
  if (pending) return pending

  const generation = getCsrfGeneration()
  const promise = fetchCsrfToken()
    .then(token => {
      if (!setCsrfToken(token, generation)) {
        // This fetch began before the token was invalidated. Never
        // return its stale result to the waiting mutation. If a new
        // generation already has a fetch in flight, join it;
        // otherwise let the request continue without a token so a
        // CSRF rejection can enter the bounded recovery path below.
        const currentPromise = getCsrfPromise()
        return currentPromise && currentPromise !== promise
          ? currentPromise
          : getCsrfToken()
      }
      return token
    })
    .catch(err => {
      setCsrfToken(null, generation)
      throw err
    })
  setCsrfPromise(promise, generation)
  return promise
}

// Identical JSON mutations share their pending promise. Binary bodies use
// object identity so distinct files/form payloads cannot silently collide.
const bodyIdentities = new WeakMap()
let nextBodyIdentity = 0
function getRequestKey(config) {
  let body = config.data
  let bodyType = 'json'
  if (body && typeof body === 'object' &&
      (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer)) {
    bodyType = 'binary'
    if (!bodyIdentities.has(body)) bodyIdentities.set(body, ++nextBodyIdentity)
    body = { binaryIdentity: bodyIdentities.get(body) }
  }
  try {
    return JSON.stringify([
      (config.method || 'GET').toUpperCase(), config.url, config.params, bodyType, body,
      config.responseType, config.rawResponse, config.headers, config.timeout,
    ])
  } catch { return null }
}

function isMutationMethod(method) {
  return ['post', 'put', 'delete', 'patch'].includes((method || '').toLowerCase())
}

// Whether a 403 is a CSRF rejection (as opposed to a real permission
// denial). Both arrive with HTTP 403; only the CSRF one has
// `detail: "CSRF Failed: ..."` in the response body, which
// normalizeError() surfaces on `err.message`.
//
// Prior to this narrowing, ANY 403 triggered the CSRF-retry path.
// A capability rejection cost a second round-trip for no benefit,
// and a persistent 403 doubled its own latency.
function isCsrfRejection(err) {
  if (err?.code !== 403) return false
  const msg = typeof err.message === 'string' ? err.message : ''
  return msg.toLowerCase().includes('csrf')
}

function isLoginRequest(config) {
  return config?.url === ENDPOINTS.AUTH.LOGIN
}

function expireSessionAndRedirect() {
  const generation=sessionGeneration()
  let ownerGeneration=generation
  if (sessionExpiryPromise && sessionExpiryGeneration===generation) return sessionExpiryPromise

  // Drop the token immediately. Loading the auth store and router is
  // intentionally dynamic to keep client -> authStore -> authService
  // -> client from becoming a static import cycle.
  clearCsrfToken()

  const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`

  const pending = Promise.all([
    import('@/stores/authStore'),
    import('@/router'),
  ])
    .then(async ([{ useAuthStore }, { default: router }]) => {
      if(generation!==sessionGeneration()) return
      const authStore = useAuthStore()
      authStore.clearSession()
      ownerGeneration=sessionGeneration()

      if (router.currentRoute.value.name !== 'Login') {
        await router.replace({
          name: 'Login',
          query: { redirect },
        })
      }
    })
    .catch(() => {
      if(ownerGeneration!==sessionGeneration()) return
      const loginUrl = new URL('/login', window.location.origin)
      loginUrl.searchParams.set('redirect', redirect)
      window.location.replace(loginUrl.toString())
    })
    .finally(() => {
      if(sessionExpiryPromise===pending) {sessionExpiryPromise = null;sessionExpiryGeneration=null}
    })

  sessionExpiryPromise=pending
  sessionExpiryGeneration=generation
  return pending
}

client.interceptors.request.use(async (config) => {
  // Accept-Language drives Django's LocaleMiddleware, which selects
  // the language DRF uses for its own built-in error messages
  // ("This field is required", "Authentication credentials were not
  // provided", ...). The active locale is the i18n singleton's
  // current value; it is always defined by the time a request fires
  // because main.js mounts the app only after i18n is initialized.
  config.headers['Accept-Language'] = i18n.global.locale.value

  if (!config.skipCsrf && isMutationMethod(config.method)) {
    try {
      const token = await ensureCsrfToken()
      if (token) {
        config.headers['X-CSRFToken'] = token
      }
    } catch (e) {
      console.warn('Unable to obtain CSRF token, request may fail:', e)
    }
  }

  if(staleSession(config)) throw sessionCancelled()
  return config
}, (error) => Promise.reject(error))

client.interceptors.response.use(
  (response) => {
    if(staleSession(response.config)) return Promise.reject(sessionCancelled())

    // Binary downloads need headers (not just response.data) so callers can
    // honor Content-Disposition. Opt in explicitly to keep the normal API
    // envelope behavior unchanged everywhere else.
    if (response.config?.rawResponse) return response

    const body = response.data
    if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
      if ('details' in body) {
        return Promise.reject({ message: body.message, code: body.code, details: body.details ?? null })
      }
      if ('data' in body) {
        if (body.data === null || body.data === undefined) {
          return { message: body.message }
        }
        return body.data
      }
    }
    return body
  },
  async (error) => {
    if(staleSession(error.config)) return Promise.reject(sessionCancelled())

    if (axios.isCancel(error)) {
      return Promise.reject({
        message: i18n.global.t('errors.requestCancelled'),
        code: 'CANCEL',
        details: null,
      })
    }

    if (error.response?.status === 401 && !isLoginRequest(error.config)) {
      await expireSessionAndRedirect()
      return Promise.reject({
        message: i18n.global.t('errors.sessionExpired'),
        code: 401,
      })
    }

    // Axios honors responseType='blob' even for JSON error envelopes. Decode
    // that small error blob before normalization so PDF export failures show
    // the backend's useful message instead of a generic server error.
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        error.response.data = JSON.parse(text)
      } catch {
        // Keep the Blob; normalizeError will use its generic fallback.
      }
    }

    const normalized = normalizeError(error)
    return Promise.reject(normalized)
  }
)

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

async function requestOnce(config, retryOptions = {}) {
  const { maxRetries = 1, retryDelay = 1000 } = retryOptions
  const method = (config.method || 'GET').toUpperCase()
  const isIdempotent = IDEMPOTENT_METHODS.has(method)

  let attempt = 0
  let csrfRecoveryRemaining = isIdempotent ? 0 : 1

  while (true) {
    try {
      return await client(config)
    } catch (err) {
      // CSRF recovery — narrow to CSRF-specific 403s only. A
      // capability rejection must not pay this cost.
      if (csrfRecoveryRemaining > 0 && isCsrfRejection(err)) {
        csrfRecoveryRemaining -= 1
        clearCsrfToken()
        continue
      }

      const isTransient = err?.code === 'NETWORK' ||
        (typeof err?.code === 'number' && err.code >= 500)

      if (
        err?.code === 'CANCEL' ||
        !isIdempotent ||
        !isTransient ||
        attempt >= maxRetries
      ) {
        throw err
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
      attempt += 1
    }
  }
}

function request(config, retryOptions = {}) {
  // Explicit cancellation belongs to its caller and cannot be shared safely.
  const requestKey=isMutationMethod(config.method) && !config.signal && !config.cancelToken ? getRequestKey(config) : null
  const key=requestKey===null ? null : `${sessionGeneration()}:${requestKey}`
  if (key && pendingRequests.has(key)) return pendingRequests.get(key)
  const generation = sessionGeneration()
  const controller = new AbortController()
  activeControllers.add(controller)
  const abort = () => controller.abort()
  if(config.signal?.aborted) abort()
  else config.signal?.addEventListener('abort', abort, { once: true })
  const promise = requestOnce({ ...config, sessionGeneration: generation, signal: controller.signal }, retryOptions)
    .then(result => { if(generation !== sessionGeneration()) throw sessionCancelled(); return result })
    .finally(() => { activeControllers.delete(controller); config.signal?.removeEventListener('abort', abort) })
  if (!key) return promise
  const shared = promise.finally(() => {
    if (pendingRequests.get(key) === shared) pendingRequests.delete(key)
  })
  pendingRequests.set(key, shared)
  return shared
}

export const apiClient = {
  get: (url, config = {}, retry = {}) => request({ method: 'GET', url, ...config }, retry),
  post: (url, data, config = {}, retry = {}) => request({ method: 'POST', url, data, ...config }, retry),
  put: (url, data, config = {}, retry = {}) => request({ method: 'PUT', url, data, ...config }, retry),
  delete: (url, config = {}, retry = {}) => request({ method: 'DELETE', url, ...config }, retry),
}

export async function fetchCsrfTokenDirect() {
  return fetchCsrfToken()
}
