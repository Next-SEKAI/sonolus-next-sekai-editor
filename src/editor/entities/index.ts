import LevelEditorConnector from './connector/LevelEditorConnector.vue'
import LevelEditorCameraEventConnection from './events/camera/LevelEditorCameraEventConnection.vue'
import LevelEditorCameraEventJoint from './events/camera/LevelEditorCameraEventJoint.vue'
import LevelEditorBpm from './LevelEditorBpm.vue'
import LevelEditorTimeScale from './LevelEditorTimeScale.vue'
import LevelEditorNote from './note/LevelEditorNote.vue'

export const entityComponents = {
    bpm: LevelEditorBpm,
    timeScale: LevelEditorTimeScale,

    cameraEventJoint: LevelEditorCameraEventJoint,
    cameraEventConnection: LevelEditorCameraEventConnection,

    note: LevelEditorNote,
    connector: LevelEditorConnector,
}
