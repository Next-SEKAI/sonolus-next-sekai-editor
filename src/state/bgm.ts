import type { Waveform } from '../waveform'

export type Bgm = {
    filename?: string
    buffer?: AudioBuffer
    waveform?: Waveform
    offset: number
}
