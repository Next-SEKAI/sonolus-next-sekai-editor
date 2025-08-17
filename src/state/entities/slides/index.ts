import type { ConnectorEntity } from './connector'
import type { NoteEntity } from './note'

export type SlideEntity = NoteEntity | ConnectorEntity

declare const idBrand: unique symbol

export type SlideId = { [idBrand]: never }

export const createSlideId = () => ({}) as SlideId
