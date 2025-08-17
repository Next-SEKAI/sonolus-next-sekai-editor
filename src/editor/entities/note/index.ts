import LevelEditorAnchorNote from './LevelEditorAnchorNote.vue'
import LevelEditorDamageNote from './LevelEditorDamageNote.vue'
import LevelEditorHeadNote from './LevelEditorHeadNote.vue'
import LevelEditorSingleNote from './LevelEditorSingleNote.vue'
import LevelEditorTailNote from './LevelEditorTailNote.vue'
import LevelEditorTickNote from './LevelEditorTickNote.vue'
import LevelEditorTraceNote from './LevelEditorTraceNote.vue'

export const noteComponents = {
    anchor: LevelEditorAnchorNote,
    damage: LevelEditorDamageNote,
    trace: LevelEditorTraceNote,
    single: LevelEditorSingleNote,
    head: LevelEditorHeadNote,
    tick: LevelEditorTickNote,
    tail: LevelEditorTailNote,
}
