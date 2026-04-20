import type { BpmObject } from './bpm'
import type { Groups } from './groups'
import type { NoteObject } from './note'
import type { TimeScaleObject } from './timeScale'

export type Chart = {
    initialLife: number
    bpms: BpmObject[]
    groups: Groups
    timeScales: TimeScaleObject[]
    slides: NoteObject[][]
}
