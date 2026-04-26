import LevelEditorConnector from './connector/LevelEditorConnector.vue'
import LevelEditorCameraEventConnection from './events/camera/LevelEditorCameraEventConnection.vue'
import LevelEditorCameraEventJoint from './events/camera/LevelEditorCameraEventJoint.vue'
import LevelEditorStageMaskEventConnection from './events/stage/mask/LevelEditorStageMaskEventConnection.vue'
import LevelEditorStageMaskEventJoint from './events/stage/mask/LevelEditorStageMaskEventJoint.vue'
import LevelEditorBpm from './LevelEditorBpm.vue'
import LevelEditorTimeScale from './LevelEditorTimeScale.vue'
import LevelEditorNote from './note/LevelEditorNote.vue'

export const entityComponents = {
    bpm: LevelEditorBpm,
    timeScale: LevelEditorTimeScale,

    cameraEventJoint: LevelEditorCameraEventJoint,
    cameraEventConnection: LevelEditorCameraEventConnection,

    stageMaskEventJoint: LevelEditorStageMaskEventJoint,
    stageMaskEventConnection: LevelEditorStageMaskEventConnection,

    note: LevelEditorNote,
    connector: LevelEditorConnector,
}
