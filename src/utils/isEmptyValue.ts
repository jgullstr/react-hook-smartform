/** Empty for a form field: nothing, or an empty string. `0` and `false` are values. */
export function isEmptyValue(value: unknown): value is undefined | null | '' {
  return value === undefined || value === null || value === ''
}
