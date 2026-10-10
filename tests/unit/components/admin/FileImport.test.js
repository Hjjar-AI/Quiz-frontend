import { it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountWithGlobals } from '../../../helpers/mountWithGlobals'
import FileImport from '@/features/admin/components/FileImport.vue'
import DropZone from '@/components/common/DropZone.vue'
import { adminService } from '@/services/adminService'
vi.mock('@/services/adminService', () => ({ adminService: { importDatabase: vi.fn() } }))
vi.mock('@/composables/useNotify', () => ({ useNotify: () => ({ notify: vi.fn() }) }))
vi.mock('@/composables/useUnsavedChanges', () => ({ useUnsavedChanges: () => ({ markBaseline: vi.fn() }) }))

it('preserves HTTP 429 through the store/wrapper and retries only the rejected/unsent files', async () => {
  adminService.importDatabase.mockResolvedValueOnce({ message: 'Confirmed' })
    .mockRejectedValueOnce({ code: 429, message: 'Too many imports' }).mockResolvedValue({ message: 'Imported' })
  const wrapper = mountWithGlobals(FileImport)
  try {
    const files = ['one.csv', 'two.json', 'three.csv'].map(name => new File(['content'], name))
    wrapper.findComponent(DropZone).vm.$emit('files-selected', files)
    await nextTick()
    const submit = () => wrapper.find('.simple-import-tab__actions button').trigger('click')
    await submit()
    await flushPromises()
    expect(adminService.importDatabase).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.simple-import-tab__actions button').element.disabled).toBe(false)
    await submit()
    await flushPromises()
    expect(adminService.importDatabase.mock.calls.map(([file]) => file.name)).toEqual(['one.csv', 'two.json', 'two.json', 'three.csv'])
  } finally { wrapper.unmount() }
})
