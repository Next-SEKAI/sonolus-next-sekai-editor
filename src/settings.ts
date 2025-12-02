import { Type, type Static, type StaticDecode, type TSchema, type TString } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { shallowRef, watch } from 'vue'
import { isCommandName, type CommandName } from './editor/commands'
import { defaultLocale } from './i18n/locale'
import { localizations } from './i18n/localizations'
import { storageGet, storageRemove, storageSet } from './storage'
import { clamp } from './utils/math'

const number = (def: number, min: number, max: number) =>
    Type.Transform(Type.Number({ default: def }))
        .Decode((value) => clamp(value, min, max))
        .Encode((value) => value)

const defaultNoteSlidePropertiesSchema = Type.Partial(
    Type.Object({
        noteType: Type.Union([
            Type.Literal('default'),
            Type.Literal('trace'),
            Type.Literal('anchor'),
            Type.Literal('damage'),
            Type.Literal('forceTick'),
            Type.Literal('forceNonTick'),
        ]),
        isAttached: Type.Boolean(),
        size: Type.Number(),
        isCritical: Type.Boolean(),
        flickDirection: Type.Union([
            Type.Literal('none'),
            Type.Literal('up'),
            Type.Literal('upLeft'),
            Type.Literal('upRight'),
            Type.Literal('down'),
            Type.Literal('downLeft'),
            Type.Literal('downRight'),
        ]),
        isFake: Type.Boolean(),
        sfx: Type.Union([
            Type.Literal('default'),
            Type.Literal('none'),
            Type.Literal('normalTap'),
            Type.Literal('criticalTap'),
            Type.Literal('normalFlick'),
            Type.Literal('criticalFlick'),
            Type.Literal('normalTrace'),
            Type.Literal('criticalTrace'),
            Type.Literal('normalTick'),
            Type.Literal('criticalTick'),
            Type.Literal('damage'),
        ]),
        isConnectorSeparator: Type.Boolean(),
        connectorType: Type.Union([Type.Literal('active'), Type.Literal('guide')]),
        connectorEase: Type.Union([
            Type.Literal('linear'),
            Type.Literal('in'),
            Type.Literal('out'),
            Type.Literal('inOut'),
            Type.Literal('outIn'),
            Type.Literal('none'),
        ]),
        connectorActiveIsCritical: Type.Boolean(),
        connectorActiveIsFake: Type.Boolean(),
        connectorGuideColor: Type.Union([
            Type.Literal('neutral'),
            Type.Literal('red'),
            Type.Literal('green'),
            Type.Literal('blue'),
            Type.Literal('yellow'),
            Type.Literal('purple'),
            Type.Literal('cyan'),
            Type.Literal('black'),
        ]),
        connectorGuideAlpha: Type.Number(),
        connectorLayer: Type.Union([Type.Literal('top'), Type.Literal('bottom')]),
    }),
)

export type DefaultNoteSlideProperties = Static<typeof defaultNoteSlidePropertiesSchema>

const settingsProperties = {
    showSidebar: Type.Boolean({ default: true }),

    sidebarWidth: Type.Number(),

    previewPosition: Type.Union([Type.Literal('auto'), Type.Literal('top'), Type.Literal('left')]),

    showPreview: Type.Boolean({ default: true }),

    previewWidth: Type.Number(),

    previewHeight: Type.Number(),

    width: number(16, 16, 100),

    pps: number(1000, 100, 10000),

    locale: Type.Union(
        Object.keys(localizations).map((locale) => Type.Literal(locale)),
        { default: defaultLocale },
    ) as never as TString,

    autoSave: Type.Boolean({ default: true }),

    autoSaveDelay: number(1, 0, 5),

    waveform: Type.Union([Type.Literal('volume'), Type.Literal('fft'), Type.Literal('off')]),

    lockScrollX: Type.Boolean({ default: true }),

    dragToPanY: Type.Boolean({ default: true }),

    dragToPanX: Type.Boolean(),

    toolbar: Type.Transform(
        Type.Array(
            Type.Transform(Type.Array(Type.String()))
                .Decode((values) => values.filter(isCommandName))
                .Encode((values) => values),
            {
                default: [
                    ['utilities', 'reset', 'save', 'open'],
                    ['bgm', 'speedUp', 'speedDown', 'stop', 'play'],
                    [
                        'redo',
                        'undo',
                        'paste',
                        'copy',
                        'cut',
                        'flip',
                        'brush',
                        'eraser',
                        'deselect',
                        'select',
                    ],
                    ['note3', 'note2', 'note1', 'note0', 'note'],
                    ['slide4', 'slide3', 'slide2', 'slide1', 'slide0', 'slide'],
                    ['timeScale', 'bpm'],
                    ['groupPrev', 'groupNext', 'groupAll'],
                    [
                        'scrollLeft',
                        'scrollRight',
                        'jumpUp',
                        'scrollPageUp',
                        'scrollUp',
                        'scrollDown',
                        'scrollPageDown',
                        'jumpDown',
                    ],
                    [
                        'snapping',
                        'divisionCustom',
                        'division16',
                        'division12',
                        'division8',
                        'division6',
                        'division4',
                        'division3',
                        'division2',
                        'division1',
                    ],
                    ['zoomXIn', 'zoomXOut', 'zoomYIn', 'zoomYOut'],
                ] satisfies CommandName[][],
            },
        ),
    )
        .Decode((values) => values.filter((value) => value.length))
        .Encode((values) => values),

    playBgmVolume: number(100, 0, 100),

    playSfxVolume: number(100, 0, 100),

    playStartPosition: Type.Union([Type.Literal('view'), Type.Literal('cursor')]),

    playFollow: Type.Boolean({ default: true }),

    playFollowPosition: number(25, 0, 100),

    mouseSecondaryTool: Type.Union([Type.Literal('eraser'), Type.Literal('select')]),

    mouseSmoothScrolling: Type.Boolean({ default: true }),

    touchQuickScrollZone: number(25, 0, 50),

    touchScrollInertia: Type.Boolean({ default: true }),

    keyboardShortcuts: Type.Transform(
        Type.Record(Type.String(), Type.String(), {
            default: {
                open: 'o',
                save: 'p',
                reset: 'n',
                utilities: '.',
                play: ' ',
                stop: 'Backspace',
                bgm: 'm',
                speedUp: "'",
                speedDown: ';',
                select: 'f',
                deselect: 'Escape',
                eraser: 'g',
                brush: 'b',
                flip: 'u',
                cut: 'x',
                copy: 'c',
                paste: 'v',
                undo: 'z',
                redo: 'y',
                note: 'a',
                slide: 's',
                bpm: 'q',
                timeScale: 'w',
                groupPrev: 'e',
                groupNext: 'r',
                groupAll: 't',
                scrollLeft: 'ArrowLeft',
                scrollRight: 'ArrowRight',
                scrollUp: 'ArrowUp',
                scrollDown: 'ArrowDown',
                scrollPageUp: 'PageUp',
                scrollPageDown: 'PageDown',
                jumpUp: 'End',
                jumpDown: 'Home',
                division1: '1',
                division2: '2',
                division3: '3',
                division4: '4',
                division6: '6',
                division8: '8',
                division12: '9',
                division16: '0',
                divisionCustom: '`',
                snapping: 'i',
                zoomXIn: ']',
                zoomXOut: '[',
                zoomYIn: '=',
                zoomYOut: '-',
                help: 'h',
                settings: ',',
            } satisfies Partial<Record<CommandName, string>>,
        }),
    )
        .Decode(
            (value) =>
                Object.fromEntries(
                    Object.entries(value).filter(([key]) => isCommandName(key)),
                ) as Partial<Record<CommandName, string>>,
        )
        .Encode((values) => values),

    defaultNotePropertiesPresets: Type.Array(defaultNoteSlidePropertiesSchema, {
        minItems: 4,
        maxItems: 4,
        default: [
            {},
            {
                isCritical: true,
            },
            {
                flickDirection: 'up',
            },
            {
                noteType: 'trace',
            },
        ] satisfies DefaultNoteSlideProperties[],
    }),

    defaultSlidePropertiesPresets: Type.Array(defaultNoteSlidePropertiesSchema, {
        minItems: 5,
        maxItems: 5,
        default: [
            {
                connectorEase: 'linear',
            },
            {
                isCritical: true,
            },
            {
                flickDirection: 'up',
            },
            {
                noteType: 'trace',
            },
            {
                noteType: 'anchor',
            },
        ] satisfies DefaultNoteSlideProperties[],
    }),
}

const normalize = <T extends TSchema>(schema: T, value: unknown) =>
    Value.Decode(schema, Value.Cast(schema, value))

export const settings = Object.defineProperties(
    {},
    Object.fromEntries(
        Object.entries(settingsProperties).map(([key, schema]) => {
            const defaultValue = Value.Create(schema)

            const prop = shallowRef(normalize(schema, storageGet(key)))
            watch(prop, (value) => {
                if (Value.Equal(value, defaultValue)) {
                    storageRemove(key)
                } else {
                    storageSet(key, value)
                }
            })

            return [
                key,
                {
                    enumerable: true,
                    get: () => prop.value,
                    set: (value: unknown) => (prop.value = normalize(schema, value)),
                },
            ]
        }),
    ),
) as {
    [K in keyof typeof settingsProperties]: StaticDecode<(typeof settingsProperties)[K]>
}
