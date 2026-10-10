import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountWithGlobals } from '../../../helpers/mountWithGlobals'
import SimpleImportTab from '@/features/admin/components/SimpleImportTab.vue'
import DropZone from '@/components/common/DropZone.vue'
import EntityRow from '@/components/common/EntityRow.vue'
import { advanceSessionScope } from '@/services/api/sessionScope'

vi.mock('@/composables/useNotify', () => ({ useNotify: () => ({ notify: vi.fn() }) }))
vi.mock('@/composables/useUnsavedChanges', () => ({ useUnsavedChanges: () => ({ markBaseline: vi.fn() }) }))

let wrappers
beforeEach(() => { wrappers = [] })
afterEach(() => wrappers.forEach(wrapper => wrapper.unmount()))

function mountTab(uploadFn, multiple = true) {
  const wrapper = mountWithGlobals(SimpleImportTab, {
    props: {
      multiple, uploadFn, accept: '.csv,.json', label: 'Files', buttonLabel: 'Import',
      allowedExtensions: ['.csv', '.json'], invalidTypeMessageFn: () => 'Invalid file',
    },
  })
  wrappers.push(wrapper)
  return wrapper
}
function select(wrapper, files) {
  wrapper.findComponent(DropZone).vm.$emit('files-selected', files)
}
function file(name) { return new File(['content'], name, { lastModified: 1 }) }
async function upload(wrapper) {
  await nextTick()
  return wrapper.find('.simple-import-tab__actions button').trigger('click')
}
function statuses(wrapper) { return wrapper.findAllComponents(EntityRow).map(row => row.text()) }

it('adds successive selections while ignoring the same file selected twice', async () => {
  const send = vi.fn().mockResolvedValue({ message: 'Imported' })
  const wrapper = mountTab(send)
  select(wrapper, [file('one.csv')])
  select(wrapper, [file('one.csv'), file('two.json')])
  await upload(wrapper)
  await flushPromises()
  expect(send.mock.calls.map(([value]) => value.name)).toEqual(['one.csv', 'two.json'])
  expect(wrapper.emitted('imported')).toHaveLength(2)
  expect(wrapper.find('.simple-import-tab__actions button').element.disabled).toBe(true)
})

it('sends one file at a time and ignores another click while a request is pending', async () => {
  let resolveFirst
  const send = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
    .mockResolvedValue({ message: 'Imported' })
  const wrapper = mountTab(send)
  select(wrapper, [file('one.csv'), file('two.json')])
  await upload(wrapper)
  await upload(wrapper)
  expect(send).toHaveBeenCalledTimes(1)
  expect(wrapper.findComponent(DropZone).props('disabled')).toBe(true)
  resolveFirst({ message: 'Imported' })
  await flushPromises()
  expect(send).toHaveBeenCalledTimes(2)
})

it('stops on failure, keeps results and resumes only files that were never sent', async () => {
  const send = vi.fn().mockResolvedValueOnce({ message: 'First confirmed' })
    .mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValue({ message: 'Third confirmed' })
  const wrapper = mountTab(send)
  select(wrapper, [file('one.csv'), file('two.json'), file('three.csv')])
  await upload(wrapper)
  await flushPromises()
  expect(send).toHaveBeenCalledTimes(2)
  expect(statuses(wrapper)[0]).toContain('First confirmed')
  expect(statuses(wrapper)[1]).toContain('Connection lost')
  await upload(wrapper)
  await flushPromises()
  expect(send.mock.calls.map(([value]) => value.name)).toEqual(['one.csv', 'two.json', 'three.csv'])
  expect(wrapper.emitted('imported')).toHaveLength(2)
})

it('can remove queued files before submitting', async () => {
  const send = vi.fn().mockResolvedValue({})
  const wrapper = mountTab(send)
  select(wrapper, [file('one.csv'), file('two.json')])
  await flushPromises()
  await wrapper.findComponent(EntityRow).find('button').trigger('click')
  await upload(wrapper)
  await flushPromises()
  expect(send.mock.calls.map(([value]) => value.name)).toEqual(['two.json'])
})

it('does not send remaining files or emit stale success after an account change', async () => {
  let resolveFirst
  const send = vi.fn(() => new Promise(resolve => { resolveFirst = resolve }))
  const wrapper = mountTab(send)
  select(wrapper, [file('one.csv'), file('two.json')])
  await upload(wrapper)
  advanceSessionScope()
  resolveFirst({ message: 'Imported' })
  await flushPromises()
  expect(send).toHaveBeenCalledTimes(1)
  expect(wrapper.emitted('imported')).toBeUndefined()
  expect(wrapper.findAllComponents(EntityRow)).toHaveLength(0)
})

it('stops the batch after unmount without submitting the next file', async () => {
  let resolveFirst
  const send = vi.fn(() => new Promise(resolve => { resolveFirst = resolve }))
  const wrapper = mountTab(send)
  select(wrapper, [file('one.csv'), file('two.json')])
  await upload(wrapper)
  wrapper.unmount()
  wrappers = []
  resolveFirst({ message: 'Imported' })
  await flushPromises()
  expect(send).toHaveBeenCalledTimes(1)
  expect(wrapper.emitted('imported')).toBeUndefined()
})

it('retains the existing single-file selection and clears it after success', async () => {
  const send = vi.fn().mockResolvedValue({})
  const wrapper = mountTab(send, false)
  wrapper.findComponent(DropZone).vm.$emit('file-selected', file('first.json'))
  wrapper.findComponent(DropZone).vm.$emit('file-selected', file('replacement.json'))
  await upload(wrapper)
  await flushPromises()
  expect(send.mock.calls.map(([value]) => value.name)).toEqual(['replacement.json'])
  expect(wrapper.findAllComponents(EntityRow)).toHaveLength(0)
})
