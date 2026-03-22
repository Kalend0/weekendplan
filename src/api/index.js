async function req(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} → ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const getTiles = () => req('/api/tiles')
export const createTile = (data) => req('/api/tiles', { method: 'POST', body: JSON.stringify(data) })
export const updateTile = (id, data) => req(`/api/tiles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteTile = (id) => req(`/api/tiles/${id}`, { method: 'DELETE' })

export const getAllocations = (weekStart) => req(`/api/allocations?week_start=${weekStart}`)
export const createAllocation = (data) => req('/api/allocations', { method: 'POST', body: JSON.stringify(data) })
export const deleteAllocation = (id) => req(`/api/allocations/${id}`, { method: 'DELETE' })
export const clearAllocations = (weekStart) => req(`/api/allocations?week_start=${weekStart}`, { method: 'DELETE' })

export const getSettings = () => req('/api/settings')
export const updateSettings = (data) => req('/api/settings', { method: 'PUT', body: JSON.stringify(data) })
