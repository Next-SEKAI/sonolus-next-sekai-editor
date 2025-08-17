import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName, type LevelDataEntity } from '@sonolus/core'
import {
    getGroup,
    getOptionalRef,
    getOptionalValue,
    getValue,
    type ParseToChart,
    type TimeScaleNames,
} from '.'
import type { Chart, NoteObject } from '../..'
import { beatSchema } from './schemas'

export const parseSlidesToChart: ParseToChart = (chart, timeScaleNames, entities) => {
    const refs = new Map<string, NoteEntity>()
    const slides = new Map<string, string[]>()

    for (const entity of entities) {
        if (!isNoteEntity(entity)) continue

        if (!entity.name) {
            chart.slides.push([toNoteObject(chart, timeScaleNames, entity, true, undefined)])
            continue
        }

        refs.set(entity.name, entity)

        let slide = slides.get(entity.name)
        if (!slide) {
            slides.set(entity.name, (slide = [entity.name]))
        }

        const nextName = getOptionalRef(entity, 'next')
        if (nextName === undefined) continue

        const nextSlide = slides.get(nextName)
        if (nextSlide) {
            slide.push(...nextSlide)

            for (const name of nextSlide) {
                slides.set(name, slide)
            }
        } else {
            slide.push(nextName)
            slides.set(nextName, slide)
        }
    }

    for (const slide of new Set(slides.values())) {
        let prevActiveHead: NoteObject | undefined
        chart.slides.push(
            slide
                .map((name) => {
                    const entity = refs.get(name)
                    if (!entity) throw new Error(`Invalid level: ref "${name}" not found`)

                    return {
                        entity,
                        beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
                    }
                })
                .sort(({ beat: a }, { beat: b }) => a - b)
                .map(({ entity }, i) => {
                    const object = toNoteObject(
                        chart,
                        timeScaleNames,
                        entity,
                        i === slide.length - 1,
                        prevActiveHead,
                    )

                    if (i === 0 || object.isConnectorSeparator) {
                        if (object.connectorType === 'active') {
                            prevActiveHead ??= object
                        } else {
                            prevActiveHead = undefined
                        }
                    }

                    return object
                }),
        )
    }
}

const noteArchetypeNames = [
    'NormalTapNote',
    'NormalFlickNote',
    'NormalTraceNote',
    'NormalTraceFlickNote',
    'NormalReleaseNote',
    'NormalHeadTapNote',
    'NormalHeadFlickNote',
    'NormalHeadTraceNote',
    'NormalHeadTraceFlickNote',
    'NormalHeadReleaseNote',
    'NormalTailTapNote',
    'NormalTailFlickNote',
    'NormalTailTraceNote',
    'NormalTailTraceFlickNote',
    'NormalTailReleaseNote',
    'NormalTickNote',
    'CriticalTapNote',
    'CriticalFlickNote',
    'CriticalTraceNote',
    'CriticalTraceFlickNote',
    'CriticalReleaseNote',
    'CriticalHeadTapNote',
    'CriticalHeadFlickNote',
    'CriticalHeadTraceNote',
    'CriticalHeadTraceFlickNote',
    'CriticalHeadReleaseNote',
    'CriticalTailTapNote',
    'CriticalTailFlickNote',
    'CriticalTailTraceNote',
    'CriticalTailTraceFlickNote',
    'CriticalTailReleaseNote',
    'CriticalTickNote',
    'DamageNote',
    'AnchorNote',
    'FakeNormalTapNote',
    'FakeNormalFlickNote',
    'FakeNormalTraceNote',
    'FakeNormalTraceFlickNote',
    'FakeNormalReleaseNote',
    'FakeNormalHeadTapNote',
    'FakeNormalHeadFlickNote',
    'FakeNormalHeadTraceNote',
    'FakeNormalHeadTraceFlickNote',
    'FakeNormalHeadReleaseNote',
    'FakeNormalTailTapNote',
    'FakeNormalTailFlickNote',
    'FakeNormalTailTraceNote',
    'FakeNormalTailTraceFlickNote',
    'FakeNormalTailReleaseNote',
    'FakeNormalTickNote',
    'FakeCriticalTapNote',
    'FakeCriticalFlickNote',
    'FakeCriticalTraceNote',
    'FakeCriticalTraceFlickNote',
    'FakeCriticalReleaseNote',
    'FakeCriticalHeadTapNote',
    'FakeCriticalHeadFlickNote',
    'FakeCriticalHeadTraceNote',
    'FakeCriticalHeadTraceFlickNote',
    'FakeCriticalHeadReleaseNote',
    'FakeCriticalTailTapNote',
    'FakeCriticalTailFlickNote',
    'FakeCriticalTailTraceNote',
    'FakeCriticalTailTraceFlickNote',
    'FakeCriticalTailReleaseNote',
    'FakeCriticalTickNote',
    'FakeDamageNote',
    'FakeAnchorNote',
] as const

type NoteArchetypeName = (typeof noteArchetypeNames)[number]

type NoteEntity = LevelDataEntity & { archetype: NoteArchetypeName }

const isNoteEntity = (entity: LevelDataEntity): entity is NoteEntity =>
    noteArchetypeNames.includes(entity.archetype as never)

const isAttachedSchema = Type.Number()

const laneSchema = Type.Number()

const sizeSchema = Type.Number({ minimum: 0 })

const directionSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
])

const directions = {
    0: 'up',
    1: 'upLeft',
    2: 'upRight',
    3: 'down',
    4: 'downLeft',
    5: 'downRight',
} as const

const isSeparatorSchema = Type.Number()

const segmentKindSchema = Type.Union([
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(51),
    Type.Literal(52),
    Type.Literal(101),
    Type.Literal(102),
    Type.Literal(103),
    Type.Literal(104),
    Type.Literal(105),
    Type.Literal(106),
    Type.Literal(107),
    Type.Literal(108),
])

const segmentKinds = {
    1: {
        connectorType: 'active',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'green',
    },
    2: {
        connectorType: 'active',
        connectorActiveIsCritical: true,
        connectorActiveIsFake: false,
        connectorGuideColor: 'yellow',
    },
    51: {
        connectorType: 'active',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: true,
        connectorGuideColor: 'green',
    },
    52: {
        connectorType: 'active',
        connectorActiveIsCritical: true,
        connectorActiveIsFake: true,
        connectorGuideColor: 'yellow',
    },
    101: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'neutral',
    },
    102: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'red',
    },
    103: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'green',
    },
    104: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'blue',
    },
    105: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'yellow',
    },
    106: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'purple',
    },
    107: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'cyan',
    },
    108: {
        connectorType: 'guide',
        connectorActiveIsCritical: false,
        connectorActiveIsFake: false,
        connectorGuideColor: 'black',
    },
} as const

const connectorEaseSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
])

const connectorEases = {
    0: 'none',
    1: 'linear',
    2: 'in',
    3: 'out',
    4: 'inOut',
    5: 'outIn',
} as const

const segmentAlphaSchema = Type.Number({ minimum: 0, maximum: 1 })

const trimStart = <T extends string, U extends string>(
    name: T,
    prefix: U,
): T extends `${U}${infer R}` ? R : T =>
    (name.startsWith(prefix) ? name.slice(prefix.length) : name) as never

const startsWith = <T extends string, U extends string>(
    name: T,
    prefix: U,
): T extends `${U}${infer R}` ? [true, R] : [false, T] =>
    (name.startsWith(prefix) ? [true, name.slice(prefix.length)] : [false, name]) as never

const toNoteObject = (
    chart: Chart,
    timeScaleNames: TimeScaleNames,
    entity: NoteEntity,
    isLast: boolean,
    prevActiveHead: NoteObject | undefined,
) => {
    const lane = getValue(entity, 'lane', laneSchema)
    const size = getValue(entity, 'size', sizeSchema)

    const object: NoteObject = {
        group: getGroup(chart, timeScaleNames, entity),
        beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
        noteType: 'default',
        isAttached: !!getValue(entity, 'isAttached', isAttachedSchema),
        left: lane - size,
        size: size * 2,
        isCritical: false,
        flickDirection: directions[getValue(entity, 'direction', directionSchema)],
        isFake: false,
        isConnectorSeparator: !!getOptionalValue(entity, 'isSeparator', isSeparatorSchema),
        ...segmentKinds[getValue(entity, 'segmentKind', segmentKindSchema)],
        connectorEase: connectorEases[getValue(entity, 'connectorEase', connectorEaseSchema)],
        connectorGuideAlpha: getValue(entity, 'segmentAlpha', segmentAlphaSchema),
    }

    const [isFake, archetype1] = startsWith(entity.archetype, 'Fake')
    object.isFake = isFake

    if (archetype1 === 'AnchorNote') {
        object.noteType = 'anchor'
        object.flickDirection = 'none'

        return object
    } else if (archetype1 === 'DamageNote') {
        object.noteType = 'damage'
        object.flickDirection = 'none'

        return object
    }

    const archetype2 = trimStart(archetype1, 'Normal')
    const [isCritical, archetype3] = startsWith(archetype2, 'Critical')
    object.isCritical = isCritical

    const [isTrace, archetype4] = startsWith(
        trimStart(trimStart(archetype3, 'Head'), 'Tail'),
        'Trace',
    )
    if (isTrace) {
        object.noteType = 'trace'
        if (archetype4 !== 'FlickNote') object.flickDirection = 'none'

        return object
    }

    if (
        !prevActiveHead ||
        isLast ||
        (object.isConnectorSeparator && object.connectorType !== 'active')
    ) {
        if (archetype4 === 'TickNote') object.noteType = 'forceTick'
    } else {
        if (archetype4 !== 'TickNote') object.noteType = 'forceNonTick'
    }

    if (archetype4 !== 'FlickNote') object.flickDirection = 'none'

    return object
}
