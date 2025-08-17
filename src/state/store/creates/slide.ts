import type { Store } from '..'
import type { Chart } from '../../../chart'
import { createSlideId } from '../../entities/slides'
import { toNoteEntity } from '../../entities/slides/note'
import { rebuildSlide } from '../../mutations/slides'
import { addToStoreGrid } from '../grid'

export const createStoreSlides = (store: Store, chart: Chart) => {
    for (const slide of chart.slides) {
        const slideId = createSlideId()

        for (const object of slide) {
            const entity = toNoteEntity(slideId, object)

            addToStoreGrid(store.grid, entity, entity.beat)

            const notes = store.slides.note.get(slideId)
            if (notes) {
                notes.push(entity)
            } else {
                store.slides.note.set(slideId, [entity])
            }
        }

        rebuildSlide(store, slideId, [])
    }
}
