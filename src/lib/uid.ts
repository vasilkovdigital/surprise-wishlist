import { load, save } from './storage'

/**
 * Анонимный идентификатор устройства/пользователя (не персональные данные).
 * Попадает в UTM исходящих ссылок и в ссылки шеринга (атрибуция рефералов).
 * После регистрации заменяется ID аккаунта.
 */
export function getUserId(): string {
  let id = load<string>('wl.uid', '')
  if (!id) {
    const rnd = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, '')
    id = 'u' + rnd.slice(0, 11).toLowerCase()
    save('wl.uid', id)
  }
  return id
}
