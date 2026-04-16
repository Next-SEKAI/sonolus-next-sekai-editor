import type { ConnectorEntity } from './connector'
import type { NoteEntity } from './note'

export type SlideEntity = NoteEntity | ConnectorEntity

declare const idBrand: unique symbol

export type SlideId = number & { [idBrand]: never }

let i = 1

export const createSlideId = () => i++ as SlideId
