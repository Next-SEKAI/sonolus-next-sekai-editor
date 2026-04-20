import type { EventEase } from '.'

export type CameraZoomVerticalAlign = 'default' | 'center'

export type CameraEventObject = {
    beat: number
    cameraLeft: number
    cameraSize: number
    cameraZoom: number
    cameraZoomTargetLane: number
    cameraZoomTargetY: number
    cameraZoomVerticalAlign: CameraZoomVerticalAlign
    cameraRotation: number
    cameraStageTilt: number
    eventEase: EventEase
}
