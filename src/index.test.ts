import * as rhf from 'react-hook-form'
import { version } from 'react-hook-form/package.json'

describe('test matrix', () => {
  it('runs against the react-hook-form version the project names', () => {
    expect(typeof rhf.useForm).toBe('function')
    const floor = process.env.SMARTFORM_RHF_FLOOR
    // The floor project names its exact version; the latest project must not be on the floor.
    expect(version).toBe(floor ?? version)
    expect(version === '7.70.0').toBe(floor !== undefined)
  })
})
