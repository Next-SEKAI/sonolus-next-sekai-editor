import { EngineArchetypeDataName } from '@sonolus/core'
import Type from 'typebox'
import { getEventRefs, parseEvents } from '.'
import { getOptionalValue, getValue, type ParseCtx } from '..'
import { beatSchema } from '../schemas'
import { eventEases, eventEaseSchema } from './schemas'

export const parseCameraEventsToChart = (
    { chart, entities }: ParseCtx,
    firstRef: string | undefined,
) => {
    if (!firstRef) return
    if (!chart.isDynamicStages)
        throw new Error('Invalid level: dynamic stage features used but not enabled')

    const refs = getEventRefs(entities, 'CameraChange')

    parseEvents(refs, firstRef, chart.cameraEvents, (entity) => {
        const lane = getValue(entity, 'lane', laneSchema)
        const size = getValue(entity, 'size', sizeSchema)

        return {
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            cameraLeft: lane - size,
            cameraSize: size * 2,
            cameraZoom: getOptionalValue(entity, 'zoom', zoomSchema) ?? 1,
            cameraZoomTargetLane:
                getOptionalValue(entity, 'zoomTargetLane', zoomTargetLaneSchema) ?? 0,
            cameraZoomTargetY: getOptionalValue(entity, 'zoomTargetY', zoomTargetYSchema) ?? 0,
            cameraZoomVerticalAlign:
                zoomVerticalAligns[
                    getOptionalValue(entity, 'zoomVerticalAlign', zoomVerticalAlignSchema) ?? 0
                ],
            cameraRotation: getOptionalValue(entity, 'rotate', rotateSchema) ?? 0,
            cameraStageTilt: getOptionalValue(entity, 'stageTilt', stageTiltSchema) ?? 1,
            eventEase: eventEases[getValue(entity, 'ease', eventEaseSchema)],
        }
    })
}

const laneSchema = Type.Number()

const sizeSchema = Type.Number({ minimum: 3, maximum: 12 })

const zoomSchema = Type.Number({ minimum: 0.01 })

const zoomTargetLaneSchema = Type.Number()

const zoomTargetYSchema = Type.Number({ minimum: -1, maximum: 1 })

const zoomVerticalAlignSchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const zoomVerticalAligns = {
    0: 'default',
    1: 'center',
} as const

const rotateSchema = Type.Number()

const stageTiltSchema = Type.Number({ minimum: 0, maximum: 1 })
