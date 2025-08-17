import LevelEditorCompoundEaseConnector from './LevelEditorCompoundEaseConnector.vue'
import LevelEditorEaseConnector from './LevelEditorEaseConnector.vue'
import LevelEditorLinearConnector from './LevelEditorLinearConnector.vue'
import LevelEditorNoneConnector from './LevelEditorNoneConnector.vue'

export const connectorComponents = {
    linear: LevelEditorLinearConnector,
    in: LevelEditorEaseConnector,
    out: LevelEditorEaseConnector,
    inOut: LevelEditorCompoundEaseConnector,
    outIn: LevelEditorCompoundEaseConnector,
    none: LevelEditorNoneConnector,
}
