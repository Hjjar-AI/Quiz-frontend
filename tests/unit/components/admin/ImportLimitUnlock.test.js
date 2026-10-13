import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithGlobals } from '../../../helpers/mountWithGlobals'
import ImportLimitUnlock from '@/features/admin/components/ImportLimitUnlock.vue'
import { adminService } from '@/services/adminService'
vi.mock('@/services/adminService', () => ({ adminService: { importLimitStatus: vi.fn(), unlockImportLimit: vi.fn() } }))
let wrapper
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  vi.clearAllMocks()
  adminService.importLimitStatus.mockResolvedValue({ active: false, expires_in: 0 })
})
afterEach(() => { wrapper?.unmount(); vi.useRealTimers() })
async function mountUnlock() {
  wrapper = mountWithGlobals(ImportLimitUnlock)
  await flushPromises()
  return wrapper
}
async function submit() {
  await wrapper.find('input[type="password"]').setValue('secret')
  await wrapper.find('.simple-import-tab__actions button').trigger('click')
  await flushPromises()
}
describe('import throttle unlock', () => {
  it('clears the password and removes active feedback after the server window expires', async () => {
    adminService.unlockImportLimit.mockResolvedValue({ active: true, expires_in: 600 })
    await mountUnlock()
    await submit()
    expect(adminService.unlockImportLimit).toHaveBeenCalledWith('secret')
    expect(wrapper.find('input').element.value).toBe('')
    expect(wrapper.find('.feedback-region').exists()).toBe(true)
    await vi.advanceTimersByTimeAsync(600000)
    expect(wrapper.find('.feedback-region').exists()).toBe(false)
  })
  it('retains wrong-password feedback without retrying or granting access', async () => {
    adminService.unlockImportLimit.mockRejectedValue({ code: 403, message: 'Wrong password' })
    await mountUnlock()
    await submit()
    expect(wrapper.text()).toContain('Wrong password')
    expect(adminService.importLimitStatus).toHaveBeenCalledTimes(1)
    expect(adminService.unlockImportLimit).toHaveBeenCalledTimes(1)
    expect(wrapper.find('input').element.value).toBe('')
  })
  it('reads the grant after response loss without replaying the password request', async () => {
    await mountUnlock()
    adminService.unlockImportLimit.mockRejectedValue({ code: 'NETWORK', message: 'Lost response' })
    adminService.importLimitStatus.mockResolvedValue({ active: true, expires_in: 580 })
    await submit()
    expect(adminService.importLimitStatus).toHaveBeenCalledTimes(2)
    expect(adminService.unlockImportLimit).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).not.toContain('Lost response')
    expect(wrapper.find('.feedback-region').exists()).toBe(true)
  })
  it('ignores the initial status read when it arrives after a confirmed unlock', async () => {
    let resolveStatus
    adminService.importLimitStatus.mockImplementationOnce(() => new Promise(resolve => { resolveStatus = resolve }))
    adminService.unlockImportLimit.mockResolvedValue({ active: true, expires_in: 600 })
    await mountUnlock()
    await submit()
    resolveStatus({ active: false, expires_in: 0 })
    await flushPromises()
    expect(wrapper.find('.feedback-region').exists()).toBe(true)
  })
  it('does not send another password request while one is pending', async () => {
    let resolveUnlock
    adminService.unlockImportLimit.mockImplementationOnce(() => new Promise(resolve => { resolveUnlock = resolve }))
    await mountUnlock()
    await wrapper.find('input[type="password"]').setValue('secret')
    const button = wrapper.find('.simple-import-tab__actions button')
    await button.trigger('click')
    await button.trigger('click')
    expect(adminService.unlockImportLimit).toHaveBeenCalledTimes(1)
    resolveUnlock({ active: true, expires_in: 600 })
    await flushPromises()
  })
})
