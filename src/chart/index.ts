import type { BpmObject } from './bpm'
import type { CameraEventObject } from './events/camera'
import type { StageMaskEventObject } from './events/stage/mask'
import type { StagePivotEventObject } from './events/stage/pivot'
import type { Groups } from './groups'
import type { NoteObject } from './note'
import type { Stages } from './stages'
import type { TimeScaleObject } from './timeScale'

export type Chart = {
    initialLife: number
    isDynamicStages: boolean
    bpms: BpmObject[]
    groups: Groups
    stages: Stages
    cameraEvents: CameraEventObject[]
    stageMaskEvents: StageMaskEventObject[]
    stagePivotEvents: StagePivotEventObject[]
    timeScales: TimeScaleObject[]
    slides: NoteObject[][]
}
