import { Value } from '@sinclair/typebox/value'
import { clipboardDataSchema, type ClipboardData } from './schema'

export const parseClipboardData = (data: unknown): ClipboardData => {
    Value.Assert(clipboardDataSchema, data)
    return data
}
