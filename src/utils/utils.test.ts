import { getByPath } from './getByPath'
import { isEmptyValue } from './isEmptyValue'

describe('getByPath', () => {
  it('walks objects and arrays by dotted path', () => {
    const source = { client: { addresses: [{ street: 'Main St' }] } }
    expect(getByPath(source, 'client.addresses.0.street')).toBe('Main St')
    expect(getByPath(source, 'client.addresses.1.street')).toBeUndefined()
    expect(getByPath(source, 'missing.deep')).toBeUndefined()
    expect(getByPath(undefined, 'a')).toBeUndefined()
    expect(getByPath({ a: null }, 'a.b')).toBeUndefined()
  })
})

describe('isEmptyValue', () => {
  it('treats only undefined, null and the empty string as empty', () => {
    expect(isEmptyValue(undefined)).toBe(true)
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue(0)).toBe(false)
    expect(isEmptyValue(false)).toBe(false)
    expect(isEmptyValue([])).toBe(false)
  })
})
