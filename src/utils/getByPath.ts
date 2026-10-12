/** Reads `source.a.0.b` for the path `'a.0.b'`; `undefined` wherever the path leaves the object. */
export function getByPath(source: unknown, path: string): unknown {
  let current: unknown = source
  for (const key of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}
