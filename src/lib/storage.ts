// localStorage с in-memory запасным вариантом (приват-режим, заблокированный storage).
const mem = new Map<string, string>()

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key) ?? mem.get(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    const raw = mem.get(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  }
}

export function save(key: string, value: unknown) {
  const raw = JSON.stringify(value)
  mem.set(key, raw)
  try { localStorage.setItem(key, raw) } catch { /* работаем из памяти */ }
}
