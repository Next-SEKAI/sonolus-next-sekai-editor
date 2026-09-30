import { EngineArchetypeDataName, type LevelDataEntity } from '@sonolus/core'
import Type from 'typebox'
import { getOptionalRef, getOptionalValue, getValue, type ParseCtx } from '.'
import type { GroupId } from '../../groups'
import type { NoteObject } from '../../note'
import type { StageId } from '../../stages'
import { beatSchema } from './schemas'

export const parseSlidesToChart = ({ chart, entities, getGroupId, getStageId }: ParseCtx) => {
    const refs = new Map<string, NoteEntity>()
    const slides = new Map<string, string[]>()

    for (const entity of entities) {
        if (!isNoteEntity(entity)) continue

        if (!entity.name) {
            chart.slides.push([
                toNoteObject(getGroupId(entity), getStageId(entity), entity, true, undefined),
            ])
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
                        getGroupId(entity),
                        getStageId(entity),
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

const styleSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
    Type.Literal(6),
    Type.Literal(7),
    Type.Literal(8),
])

const noteColors = {
    0: 'default',
    1: 'neutral',
    2: 'red',
    3: 'green',
    4: 'blue',
    5: 'yellow',
    6: 'purple',
    7: 'cyan',
    8: 'black',
} as const

const sfxSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
    Type.Literal(6),
    Type.Literal(7),
    Type.Literal(8),
    Type.Literal(9),
    Type.Literal(10),
])

const sfxs = {
    0: 'default',
    1: 'none',
    2: 'normalTap',
    3: 'normalFlick',
    4: 'normalTrace',
    5: 'normalTick',
    6: 'criticalTap',
    7: 'criticalFlick',
    8: 'criticalTrace',
    9: 'criticalTick',
    10: 'damage',
} as const

const isSeparatorSchema = Type.Number()

const segmentKindSchema = Type.Union([
    Type.Literal(1),
    Type.Literal(11),
    Type.Literal(12),
    Type.Literal(13),
    Type.Literal(14),
    Type.Literal(15),
    Type.Literal(16),
    Type.Literal(17),
    Type.Literal(18),
    Type.Literal(2),
    Type.Literal(21),
    Type.Literal(22),
    Type.Literal(23),
    Type.Literal(24),
    Type.Literal(25),
    Type.Literal(26),
    Type.Literal(27),
    Type.Literal(28),
    Type.Literal(51),
    Type.Literal(61),
    Type.Literal(62),
    Type.Literal(63),
    Type.Literal(64),
    Type.Literal(65),
    Type.Literal(66),
    Type.Literal(67),
    Type.Literal(68),
    Type.Literal(52),
    Type.Literal(71),
    Type.Literal(72),
    Type.Literal(73),
    Type.Literal(74),
    Type.Literal(75),
    Type.Literal(76),
    Type.Literal(77),
    Type.Literal(78),
    Type.Literal(3),
    Type.Literal(31),
    Type.Literal(32),
    Type.Literal(33),
    Type.Literal(34),
    Type.Literal(35),
    Type.Literal(36),
    Type.Literal(37),
    Type.Literal(38),
    Type.Literal(53),
    Type.Literal(81),
    Type.Literal(82),
    Type.Literal(83),
    Type.Literal(84),
    Type.Literal(85),
    Type.Literal(86),
    Type.Literal(87),
    Type.Literal(88),
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
    1: ['active', 'default', false, false],
    11: ['active', 'neutral', false, false],
    12: ['active', 'red', false, false],
    13: ['active', 'green', false, false],
    14: ['active', 'blue', false, false],
    15: ['active', 'yellow', false, false],
    16: ['active', 'purple', false, false],
    17: ['active', 'cyan', false, false],
    18: ['active', 'black', false, false],
    2: ['active', 'default', false, true],
    21: ['active', 'neutral', false, true],
    22: ['active', 'red', false, true],
    23: ['active', 'green', false, true],
    24: ['active', 'blue', false, true],
    25: ['active', 'yellow', false, true],
    26: ['active', 'purple', false, true],
    27: ['active', 'cyan', false, true],
    28: ['active', 'black', false, true],
    51: ['active', 'default', true, false],
    61: ['active', 'neutral', true, false],
    62: ['active', 'red', true, false],
    63: ['active', 'green', true, false],
    64: ['active', 'blue', true, false],
    65: ['active', 'yellow', true, false],
    66: ['active', 'purple', true, false],
    67: ['active', 'cyan', true, false],
    68: ['active', 'black', true, false],
    52: ['active', 'default', true, true],
    71: ['active', 'neutral', true, true],
    72: ['active', 'red', true, true],
    73: ['active', 'green', true, true],
    74: ['active', 'blue', true, true],
    75: ['active', 'yellow', true, true],
    76: ['active', 'purple', true, true],
    77: ['active', 'cyan', true, true],
    78: ['active', 'black', true, true],
    3: ['damage', 'default', false, false],
    31: ['damage', 'neutral', false, false],
    32: ['damage', 'red', false, false],
    33: ['damage', 'green', false, false],
    34: ['damage', 'blue', false, false],
    35: ['damage', 'yellow', false, false],
    36: ['damage', 'purple', false, false],
    37: ['damage', 'cyan', false, false],
    38: ['damage', 'black', false, false],
    53: ['damage', 'default', true, false],
    81: ['damage', 'neutral', true, false],
    82: ['damage', 'red', true, false],
    83: ['damage', 'green', true, false],
    84: ['damage', 'blue', true, false],
    85: ['damage', 'yellow', true, false],
    86: ['damage', 'purple', true, false],
    87: ['damage', 'cyan', true, false],
    88: ['damage', 'black', true, false],
    101: ['guide', 'neutral', false, false],
    102: ['guide', 'red', false, false],
    103: ['guide', 'green', false, false],
    104: ['guide', 'blue', false, false],
    105: ['guide', 'yellow', false, false],
    106: ['guide', 'purple', false, false],
    107: ['guide', 'cyan', false, false],
    108: ['guide', 'black', false, false],
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

const segmentAlphaSchema = Type.Number({ minimum: 0, maximum: 2 })

const segmentLayerSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
])

const connectorLayers = {
    0: 'top',
    1: 'bottom',
    2: 'under',
    3: 'over',
} as const

const segmentPresentationSchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const connectorPresentations = {
    0: 'default',
    1: 'fullscreen',
} as const

const segmentThroughJudgeLineSchema = Type.Number()

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
    groupId: GroupId,
    stageId: StageId,
    entity: NoteEntity,
    isLast: boolean,
    prevActiveHead: NoteObject | undefined,
) => {
    const lane = getValue(entity, 'lane', laneSchema)
    const size = getValue(entity, 'size', sizeSchema)

    const [connectorType, connectorColor, connectorIsFake, connectorActiveIsCritical] =
        segmentKinds[getValue(entity, 'segmentKind', segmentKindSchema)]

    const object: NoteObject = {
        groupId,
        stageId,
        beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
        noteType: 'default',
        isAttached: !!getValue(entity, 'isAttached', isAttachedSchema),
        left: lane - size,
        size: size * 2,
        isCritical: false,
        flickDirection: directions[getValue(entity, 'direction', directionSchema)],
        noteColor: noteColors[getOptionalValue(entity, 'style', styleSchema) ?? 0],
        isFake: false,
        sfx: sfxs[getOptionalValue(entity, 'effectKind', sfxSchema) ?? 0],
        isConnectorSeparator: !!getOptionalValue(entity, 'isSeparator', isSeparatorSchema),
        connectorType,
        connectorColor,
        connectorIsFake,
        connectorActiveIsCritical,
        connectorEase: connectorEases[getValue(entity, 'connectorEase', connectorEaseSchema)],
        connectorGuideAlpha: getValue(entity, 'segmentAlpha', segmentAlphaSchema),
        connectorLayer:
            connectorLayers[getOptionalValue(entity, 'segmentLayer', segmentLayerSchema) ?? 0],
        connectorIsPassThrough: !!getOptionalValue(
            entity,
            'segmentThroughJudgeLine',
            segmentThroughJudgeLineSchema,
        ),
        connectorPresentation:
            connectorPresentations[
                getOptionalValue(entity, 'segmentPresentation', segmentPresentationSchema) ?? 0
            ],
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
