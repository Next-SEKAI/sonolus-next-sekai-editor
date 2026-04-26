import type { GlobalEventRanges } from './globalEventRanges'
import type { StoreGrid } from './grid'
import type { StoreSlides } from './slides'
import type { StageEventRanges } from './stageEventRanges'

export type Store = {
    grid: StoreGrid
    globalEventRanges: GlobalEventRanges
    stageEventRanges: StageEventRanges
    slides: StoreSlides
}
