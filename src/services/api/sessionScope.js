// Independent of CSRF rotation: identifies the authenticated client lifetime.
let generation = 0
const listeners = new Set()
export const sessionGeneration = () => generation
export function advanceSessionScope() { generation++; for (const listener of listeners) listener() }
export function onSessionScopeChange(listener) { listeners.add(listener) }
export const sessionCancelled = () => ({ code: 'CANCEL', message: '', details: null })
