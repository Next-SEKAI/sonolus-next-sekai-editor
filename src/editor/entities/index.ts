import LevelEditorConnector from './connector/LevelEditorConnector.vue'
import LevelEditorBpm from './LevelEditorBpm.vue'
import LevelEditorTimeScale from './LevelEditorTimeScale.vue'
import LevelEditorNote from './note/LevelEditorNote.vue'

export const entityComponents = {
    bpm: LevelEditorBpm,
    timeScale: LevelEditorTimeScale,

    note: LevelEditorNote,
    connector: LevelEditorConnector,
}
