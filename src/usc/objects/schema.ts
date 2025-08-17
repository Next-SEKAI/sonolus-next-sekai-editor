import { Type, type Static } from '@sinclair/typebox'

const uscBpmChangeSchema = Type.Object({
    type: Type.Literal('bpm'),
    beat: Type.Number(),
    bpm: Type.Number(),
})

const uscTimeScaleChangeSchema = Type.Object({
    type: Type.Literal('timeScaleGroup'),
    changes: Type.Array(
        Type.Object({
            beat: Type.Number(),
            timeScale: Type.Number(),
        }),
    ),
})

const uscSingleNoteSchema = Type.Object({
    type: Type.Literal('single'),
    beat: Type.Number(),
    timeScaleGroup: Type.Number(),
    lane: Type.Number(),
    size: Type.Number(),
    critical: Type.Boolean(),
    trace: Type.Boolean(),
    direction: Type.Optional(
        Type.Union([
            Type.Literal('left'),
            Type.Literal('up'),
            Type.Literal('right'),
            Type.Literal('none'),
        ]),
    ),
})

const uscSlideNoteSchema = Type.Object({
    type: Type.Literal('slide'),
    critical: Type.Boolean(),
    connections: Type.Array(
        Type.Union([
            Type.Object({
                type: Type.Literal('start'),
                beat: Type.Number(),
                timeScaleGroup: Type.Number(),
                lane: Type.Number(),
                size: Type.Number(),
                critical: Type.Boolean(),
                ease: Type.Union([
                    Type.Literal('out'),
                    Type.Literal('linear'),
                    Type.Literal('in'),
                    Type.Literal('inout'),
                    Type.Literal('outin'),
                ]),
                judgeType: Type.Union([
                    Type.Literal('trace'),
                    Type.Literal('none'),
                    Type.Literal('normal'),
                ]),
            }),
            Type.Object({
                type: Type.Literal('tick'),
                beat: Type.Number(),
                timeScaleGroup: Type.Number(),
                lane: Type.Number(),
                size: Type.Number(),
                critical: Type.Optional(Type.Boolean()),
                ease: Type.Union([
                    Type.Literal('out'),
                    Type.Literal('linear'),
                    Type.Literal('in'),
                    Type.Literal('inout'),
                    Type.Literal('outin'),
                ]),
            }),
            Type.Object({
                type: Type.Literal('attach'),
                beat: Type.Number(),
                critical: Type.Optional(Type.Boolean()),
                timeScaleGroup: Type.Optional(Type.Number()),
            }),
            Type.Object({
                type: Type.Literal('end'),
                beat: Type.Number(),
                timeScaleGroup: Type.Number(),
                lane: Type.Number(),
                size: Type.Number(),
                critical: Type.Boolean(),
                direction: Type.Optional(
                    Type.Union([Type.Literal('left'), Type.Literal('up'), Type.Literal('right')]),
                ),
                judgeType: Type.Union([
                    Type.Literal('trace'),
                    Type.Literal('none'),
                    Type.Literal('normal'),
                ]),
            }),
        ]),
    ),
})

const uscGuideNoteSchema = Type.Object({
    type: Type.Literal('guide'),
    color: Type.Union([
        Type.Literal('neutral'),
        Type.Literal('red'),
        Type.Literal('green'),
        Type.Literal('blue'),
        Type.Literal('yellow'),
        Type.Literal('purple'),
        Type.Literal('cyan'),
        Type.Literal('black'),
    ]),
    fade: Type.Union([Type.Literal('none'), Type.Literal('out'), Type.Literal('in')]),
    midpoints: Type.Array(
        Type.Object({
            beat: Type.Number(),
            timeScaleGroup: Type.Number(),
            lane: Type.Number(),
            size: Type.Number(),
            ease: Type.Union([
                Type.Literal('out'),
                Type.Literal('linear'),
                Type.Literal('in'),
                Type.Literal('inout'),
                Type.Literal('outin'),
            ]),
        }),
    ),
})

const uscDamageNoteSchema = Type.Object({
    type: Type.Literal('damage'),
    beat: Type.Number(),
    timeScaleGroup: Type.Number(),
    lane: Type.Number(),
    size: Type.Number(),
})

export const uscObjectSchema = Type.Union([
    uscBpmChangeSchema,
    uscTimeScaleChangeSchema,
    uscSingleNoteSchema,
    uscSlideNoteSchema,
    uscGuideNoteSchema,
    uscDamageNoteSchema,
])

export type UscObject = Static<typeof uscObjectSchema>
