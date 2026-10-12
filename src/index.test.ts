import * as rhf from 'react-hook-form'
import { version } from 'react-hook-form/package.json'
import * as smartform from './index'

describe('public surface', () => {
  it('exports exactly these runtime names', () => {
    expect(Object.keys(smartform).sort()).toEqual(
      [
        'FIELD_ARRAY_KEY',
        'FieldArray',
        'FieldArrayContext',
        'Form',
        'FormScope',
        'FormScopeContext',
        'Hidden',
        'SubmitContext',
        'getScopedPath',
        'useFieldArrayScope',
        'useFormScope',
        'useScopedController',
        'useSmartForm',
        'useSmartFormSubmit',
        'withFieldArray',
      ].sort(),
    )
  })
})

describe('test matrix', () => {
  it('runs against the react-hook-form version the project names', () => {
    expect(typeof rhf.useForm).toBe('function')
    const floor = process.env.SMARTFORM_RHF_FLOOR
    // The floor project names its exact version; the latest project must not be on the floor.
    expect(version).toBe(floor ?? version)
    expect(version === '7.70.0').toBe(floor !== undefined)
  })
})
