import Type from 'typebox'

export const eventEaseSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
])

export const eventEases = {
    0: 'none',
    1: 'linear',
    2: 'in',
    3: 'out',
    4: 'inOut',
    5: 'outIn',
} as const
