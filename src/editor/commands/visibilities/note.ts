import { createVisibility } from '.'
import NoteVisibilityIcon from './NoteVisibilityIcon.vue'

export const noteVisibility = createVisibility('note', {
    is: NoteVisibilityIcon,
})
