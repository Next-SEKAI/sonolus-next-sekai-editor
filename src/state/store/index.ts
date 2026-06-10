import type { GlobalEventRanges } from './globalEventRanges'
import type { StoreGrid } from './grid'
import type { StoreSlides } from './slides'

export type Store = {
    grid: StoreGrid
    globalEventRanges: GlobalEventRanges
    slides: StoreSlides
}
