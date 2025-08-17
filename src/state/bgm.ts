import type { Waveform } from '../waveform'

export type Bgm = {
    buffer?: AudioBuffer
    waveform?: Waveform
    offset: number
}
