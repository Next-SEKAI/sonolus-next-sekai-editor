import { Value } from '@sinclair/typebox/value'
import { uscSchema, type Usc } from './schema'

export const parseUsc = (data: unknown): Usc => {
    Value.Assert(uscSchema, data)
    return data
}
