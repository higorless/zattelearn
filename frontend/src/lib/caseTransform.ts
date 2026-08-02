function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
}

export function keysToCamel<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map(keysToCamel) as T
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [toCamel(k), keysToCamel(v)]),
    ) as T
  }
  return obj as T
}

export function keysToSnake<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map(keysToSnake) as T
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [toSnake(k), keysToSnake(v)]),
    ) as T
  }
  return obj as T
}
