import type { ZKey } from '../gl'

export const LAYER_ACTIVE_SLIDE_CONNECTOR_UNDER = 0
export const LAYER_GUIDE_CONNECTOR_UNDER = 1
export const LAYER_STAGE = 2
export const LAYER_COVER = 4
export const LAYER_SLOT_EFFECT = 5

export const LAYER_ACTIVE_SLIDE_CONNECTOR_BOTTOM = 7
export const LAYER_GUIDE_CONNECTOR_BOTTOM = 8
export const LAYER_ACTIVE_SLIDE_CONNECTOR_TOP = 9
export const LAYER_GUIDE_CONNECTOR_TOP = 10
export const LAYER_SIM_LINE = 12

export const LAYER_NOTE_SLIM_BODY = 16
export const LAYER_NOTE_FLICK_BODY = 17
export const LAYER_NOTE_BODY = 18
export const LAYER_NOTE_TICK = 19
export const LAYER_NOTE_ARROW = 20
export const LAYER_SLOT_GLOW_EFFECT = 21

export const LAYER_ACTIVE_SLIDE_CONNECTOR_OVER = 22
export const LAYER_GUIDE_CONNECTOR_OVER = 23

export const getZ = (layer: number, time = 0, lane = 0, etc = 0, invertTime = false): ZKey => [
    layer,
    invertTime ? time : -time,
    Math.abs(lane),
    etc,
    lane > 0 ? 1 : 0,
]

export const getZAlt = (layer: number, sublayer: number): ZKey => [layer, -1e8, sublayer]
