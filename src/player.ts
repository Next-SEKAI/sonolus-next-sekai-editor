import { watch } from 'vue'
import normalTickUrl from './assets/se_live_connect.mp3?url'
import criticalTickUrl from './assets/se_live_connect_critical.mp3?url'
import criticalTapUrl from './assets/se_live_critical.mp3?url'
import normalFlickUrl from './assets/se_live_flick.mp3?url'
import criticalFlickUrl from './assets/se_live_flick_critical.mp3?url'
import normalActiveUrl from './assets/se_live_long.mp3?url'
import criticalActiveUrl from './assets/se_live_long_critical.mp3?url'
import normalTapUrl from './assets/se_live_perfect.mp3?url'
import normalTraceUrl from './assets/se_live_trace.mp3?url'
import criticalTraceUrl from './assets/se_live_trace_critical.mp3?url'
import { view } from './editor/view'
import { bgm } from './history/bgm'
import { bpms } from './history/bpms'
import { cullEntities, store } from './history/store'
import { settings } from './settings'
import type { ConnectorEntity } from './state/entities/slides/connector'
import { beatToTime, timeToBeat } from './state/integrals/bpms'
import { beatToKey } from './state/store/grid'
import { time } from './time'
import { entries } from './utils/object'
import { optional } from './utils/optional'

const delay = 0.2

const context = new AudioContext()

const sfxBuffers = {
    normalTick: optional<AudioBuffer>(),
    criticalTick: optional<AudioBuffer>(),
    criticalTap: optional<AudioBuffer>(),
    normalFlick: optional<AudioBuffer>(),
    criticalFlick: optional<AudioBuffer>(),
    normalTap: optional<AudioBuffer>(),
    normalTrace: optional<AudioBuffer>(),
    criticalTrace: optional<AudioBuffer>(),
    normalActive: optional<AudioBuffer>(),
    criticalActive: optional<AudioBuffer>(),
}

type ActiveAudio = {
    node: AudioNode
    source: AudioBufferSourceNode
    endBeat: number
}

let state:
    | {
          speed: number
          time: number
          bgmTime: number
          contextTime: number

          lastTime: number
          nodes: Set<AudioNode>
          actives: {
              normalActive: Set<ActiveAudio>
              criticalActive: Set<ActiveAudio>
          }
      }
    | undefined

let preview: AudioNode | undefined

watch(time, ({ now }) => {
    if (!state) return

    const beats = {
        min: timeToBeat(bpms.value, (state.lastTime - state.time) * state.speed + state.bgmTime),
        max: timeToBeat(bpms.value, (now - state.time) * state.speed + state.bgmTime),
    }

    const keys = {
        min: beatToKey(beats.min),
        max: beatToKey(beats.max),
    }

    const targets = {
        normalTick: new Set<number>(),
        criticalTick: new Set<number>(),
        criticalTap: new Set<number>(),
        normalFlick: new Set<number>(),
        criticalFlick: new Set<number>(),
        normalTap: new Set<number>(),
        normalTrace: new Set<number>(),
        criticalTrace: new Set<number>(),
    }

    for (const entity of cullEntities('note', keys.min, keys.max)) {
        if (entity.beat < beats.min || entity.beat >= beats.max) continue

        if (entity.isFake) continue

        if (entity.noteType === 'anchor') continue

        if (entity.noteType === 'damage') continue

        const infos = store.value.slides.info.get(entity.slideId)
        if (!infos) throw new Error('Unexpected missing infos')

        const info = infos.find((info) => info.note === entity)
        if (!info) throw new Error('Unexpected missing info')

        const isInActive = info.activeHead !== info.activeTail
        const isActiveHead = info.activeHead === info.note
        const isActiveTail = info.activeTail === info.note
        const isFlick = info.note.flickDirection !== 'none'

        if (entity.noteType === 'trace') {
            if (isFlick) {
                if (entity.isCritical) {
                    targets.criticalFlick.add(entity.beat)
                } else {
                    targets.normalFlick.add(entity.beat)
                }
            } else {
                if (entity.isCritical) {
                    targets.criticalTrace.add(entity.beat)
                } else {
                    targets.normalTrace.add(entity.beat)
                }
            }
        } else if (entity.noteType === 'forceTick') {
            if (entity.isCritical) {
                targets.criticalTick.add(entity.beat)
            } else {
                targets.normalTick.add(entity.beat)
            }
        } else if (!isInActive) {
            if (isFlick) {
                if (entity.isCritical) {
                    targets.criticalFlick.add(entity.beat)
                } else {
                    targets.normalFlick.add(entity.beat)
                }
            } else {
                if (entity.isCritical) {
                    targets.criticalTap.add(entity.beat)
                } else {
                    targets.normalTap.add(entity.beat)
                }
            }
        } else if (isActiveHead) {
            targets.normalTap.add(entity.beat)
        } else if (isActiveTail) {
            if (isFlick) {
                if (entity.isCritical) {
                    targets.criticalFlick.add(entity.beat)
                } else {
                    targets.normalFlick.add(entity.beat)
                }
            } else {
                targets.normalTap.add(entity.beat)
            }
        } else if (entity.noteType === 'default') {
            if (entity.isCritical) {
                targets.criticalTick.add(entity.beat)
            } else {
                targets.normalTick.add(entity.beat)
            }
        } else {
            if (isFlick) {
                if (entity.isCritical) {
                    targets.criticalFlick.add(entity.beat)
                } else {
                    targets.normalFlick.add(entity.beat)
                }
            } else {
                if (entity.isCritical) {
                    targets.criticalTap.add(entity.beat)
                } else {
                    targets.normalTap.add(entity.beat)
                }
            }
        }
    }

    for (const [type, beats] of entries(targets)) {
        if (!sfxBuffers[type]) continue

        for (const beat of beats) {
            schedule(
                state.nodes,
                sfxBuffers[type],
                settings.playSfxVolume,
                (beatToTime(bpms.value, beat) - state.bgmTime) / state.speed +
                    state.contextTime +
                    delay,
            )
        }
    }

    const activeTargets = {
        normalActive: Array<ConnectorEntity>(),
        criticalActive: Array<ConnectorEntity>(),
    }

    for (const entity of cullEntities('connector', keys.min, keys.max)) {
        if (entity.head.beat < beats.min || entity.head.beat >= beats.max) continue

        if (entity.segmentHead.connectorType !== 'active') continue
        if (entity.segmentHead.connectorActiveIsFake) continue

        if (entity.segmentHead.connectorActiveIsCritical) {
            activeTargets.criticalActive.push(entity)
        } else {
            activeTargets.normalActive.push(entity)
        }
    }

    for (const [type, entities] of entries(activeTargets)) {
        if (!sfxBuffers[type]) continue

        for (const entity of entities.sort((a, b) => a.head.beat - b.head.beat)) {
            scheduleActive(
                state.actives[type],
                sfxBuffers[type],
                entity.head.beat,
                entity.tail.beat,
                settings.playSfxVolume,
                (beatToTime(bpms.value, entity.head.beat) - state.bgmTime) / state.speed +
                    state.contextTime +
                    delay,
                (beatToTime(bpms.value, entity.tail.beat) - state.bgmTime) / state.speed +
                    state.contextTime +
                    delay,
            )
        }
    }

    state.lastTime = now
})

export const loadBgm = (data: ArrayBuffer) => context.decodeAudioData(data)

export const startPlayer = (bgmTime: number, speed: number) => {
    const time = performance.now() / 1000
    const contextTime = context.currentTime

    state = {
        speed,
        time,
        bgmTime,
        contextTime,

        lastTime: time,
        nodes: new Set(),
        actives: {
            normalActive: new Set(),
            criticalActive: new Set(),
        },
    }

    startContext()

    if (bgm.value.buffer)
        schedule(
            state.nodes,
            bgm.value.buffer,
            settings.playBgmVolume,
            contextTime + delay,
            bgmTime + bgm.value.offset,
            speed,
        )

    return time + delay
}

export const stopPlayer = () => {
    if (!state) return

    for (const node of state.nodes) {
        node.disconnect()
    }

    for (const actives of Object.values(state.actives)) {
        for (const { node } of actives) {
            node.disconnect()
        }
    }

    state = undefined
}

export const previewPlayer = () => {
    startContext()

    if (!bgm.value.buffer) return

    const offset = view.cursorTime + bgm.value.offset
    if (offset < 0) return

    const source = new AudioBufferSourceNode(context, {
        buffer: bgm.value.buffer,
    })
    const gain = new GainNode(context, {
        gain: settings.playBgmVolume / 100,
    })

    gain.connect(context.destination)
    preview = gain

    source.connect(gain)

    const time = context.currentTime
    gain.gain.linearRampToValueAtTime(0, time + 0.5)
    source.start(time, offset, 0.5)
}

const startContext = () => {
    if (context.state !== 'running') {
        void context.resume()
    }

    if (preview) {
        preview.disconnect()
        preview = undefined
    }
}

const schedule = (
    nodes: Set<AudioNode>,
    buffer: AudioBuffer,
    volume: number,
    when: number,
    offset = 0,
    speed = 1,
) => {
    const source = new AudioBufferSourceNode(context, {
        buffer,
        playbackRate: speed,
    })
    const gain = new GainNode(context, {
        gain: volume / 100,
    })

    gain.connect(context.destination)
    nodes.add(gain)

    source.connect(gain)
    source.onended = () => {
        gain.disconnect()
        nodes.delete(gain)
    }

    if (offset < 0) {
        source.start(when - offset / speed)
    } else {
        source.start(when, offset)
    }
}

const scheduleActive = (
    actives: Set<ActiveAudio>,
    buffer: AudioBuffer,
    startBeat: number,
    endBeat: number,
    volume: number,
    whenStart: number,
    whenStop: number,
) => {
    for (const active of actives) {
        if (active.endBeat < startBeat) continue

        active.endBeat = endBeat
        active.source.stop(whenStop)
        return
    }

    const source = new AudioBufferSourceNode(context, {
        buffer,
        loop: true,
    })
    const gain = new GainNode(context, {
        gain: volume / 100,
    })

    gain.connect(context.destination)

    const active = {
        node: gain,
        source,
        endBeat,
    }
    actives.add(active)

    source.connect(gain)
    source.onended = () => {
        gain.disconnect()
        actives.delete(active)
    }

    source.start(whenStart)
    source.stop(whenStop)
}

const loadSfx = () => {
    const load = async (type: keyof typeof sfxBuffers, url: string) => {
        const response = await fetch(url)
        const data = await response.arrayBuffer()
        sfxBuffers[type] = await context.decodeAudioData(data)
    }

    void load('normalTick', normalTickUrl)
    void load('criticalTick', criticalTickUrl)
    void load('criticalTap', criticalTapUrl)
    void load('normalFlick', normalFlickUrl)
    void load('criticalFlick', criticalFlickUrl)
    void load('normalTap', normalTapUrl)
    void load('normalTrace', normalTraceUrl)
    void load('criticalTrace', criticalTraceUrl)
    void load('normalActive', normalActiveUrl)
    void load('criticalActive', criticalActiveUrl)
}

loadSfx()
