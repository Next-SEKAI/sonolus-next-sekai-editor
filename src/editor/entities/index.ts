import LevelEditorConnector from './connector/LevelEditorConnector.vue'
import LevelEditorCameraEventConnection from './events/camera/LevelEditorCameraEventConnection.vue'
import LevelEditorCameraEventJoint from './events/camera/LevelEditorCameraEventJoint.vue'
import LevelEditorStageMaskEventConnection from './events/stage/mask/LevelEditorStageMaskEventConnection.vue'
import LevelEditorStageMaskEventJoint from './events/stage/mask/LevelEditorStageMaskEventJoint.vue'
import LevelEditorStagePivotEventConnection from './events/stage/pivot/LevelEditorStagePivotEventConnection.vue'
import LevelEditorStagePivotEventJoint from './events/stage/pivot/LevelEditorStagePivotEventJoint.vue'
import LevelEditorStageStyleEventJoint from './events/stage/style/LevelEditorStageStyleEventJoint.vue'
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

    stagePivotEventJoint: LevelEditorStagePivotEventJoint,
    stagePivotEventConnection: LevelEditorStagePivotEventConnection,

    stageStyleEventJoint: LevelEditorStageStyleEventJoint,
    stageStyleEventConnection: undefined,

    note: LevelEditorNote,
    connector: LevelEditorConnector,
}
