import type {
    ConnectorEase,
    ConnectorGuideColor,
    ConnectorLayer,
    ConnectorType,
    FlickDirection,
    NoteSfx,
    NoteType,
} from '../../chart'
import { selectedEntities } from '../../history/selectedEntities'
import type { DefaultNoteSlideProperties } from '../../settings'
import { entries } from '../../utils/object'
import { editSelectedEditableEntities } from '../sidebars/default'

export const quickEdit = (properties: DefaultNoteSlideProperties) => {
    let count = 0
    let key: keyof DefaultNoteSlideProperties | undefined

    for (const [k, v] of entries(properties)) {
        if (v === undefined) continue

        count++
        key = k
    }

    if (count > 1) {
        editSelectedEditableEntities(properties)
        return
    }

    if (!key) return

    let value: unknown
    for (const entity of selectedEntities.value) {
        if (entity.type !== 'note') continue

        if (value === undefined) {
            value = entity[key]
        } else if (value !== entity[key]) {
            value = undefined
            break
        }
    }

    if (value === undefined) {
        editSelectedEditableEntities(properties)
        return
    }

    switch (key) {
        case 'noteType':
            editSelectedEditableEntities({
                noteType: rotate(value as NoteType, [
                    'default',
                    'trace',
                    'anchor',
                    'damage',
                    'forceTick',
                    'forceNonTick',
                ]),
            })
            break
        case 'isAttached':
            editSelectedEditableEntities({ isAttached: !value })
            break
        case 'size':
            editSelectedEditableEntities({ size: value as never })
            break
        case 'isCritical':
            editSelectedEditableEntities({ isCritical: !value })
            break
        case 'flickDirection':
            editSelectedEditableEntities({
                flickDirection: rotate(value as FlickDirection, [
                    'none',
                    'up',
                    'upLeft',
                    'upRight',
                    'down',
                    'downLeft',
                    'downRight',
                ]),
            })
            break
        case 'isFake':
            editSelectedEditableEntities({ isFake: !value })
            break
        case 'sfx':
            editSelectedEditableEntities({
                sfx: rotate(value as NoteSfx, [
                    'default',
                    'none',
                    'normalTap',
                    'criticalTap',
                    'normalFlick',
                    'criticalFlick',
                    'normalTrace',
                    'criticalTrace',
                    'normalTick',
                    'criticalTick',
                    'damage',
                ]),
            })
            break
        case 'isConnectorSeparator':
            editSelectedEditableEntities({ isConnectorSeparator: !value })
            break
        case 'connectorType':
            editSelectedEditableEntities({
                connectorType: rotate(value as ConnectorType, ['active', 'guide']),
            })
            break
        case 'connectorEase':
            editSelectedEditableEntities({
                connectorEase: rotate(value as ConnectorEase, [
                    'linear',
                    'in',
                    'out',
                    'inOut',
                    'outIn',
                    'none',
                ]),
            })
            break
        case 'connectorActiveIsCritical':
            editSelectedEditableEntities({ connectorActiveIsCritical: !value })
            break
        case 'connectorActiveIsFake':
            editSelectedEditableEntities({ connectorActiveIsFake: !value })
            break
        case 'connectorGuideColor':
            editSelectedEditableEntities({
                connectorGuideColor: rotate(value as ConnectorGuideColor, [
                    'neutral',
                    'red',
                    'green',
                    'blue',
                    'yellow',
                    'purple',
                    'cyan',
                    'black',
                ]),
            })
            break
        case 'connectorGuideAlpha':
            editSelectedEditableEntities({ connectorGuideAlpha: value as never })
            break
        case 'connectorLayer':
            editSelectedEditableEntities({
                connectorLayer: rotate(value as ConnectorLayer, ['top', 'bottom']),
            })
            break
    }
}

const rotate = <T>(value: T, values: T[]) => values[(values.indexOf(value) + 1) % values.length]
