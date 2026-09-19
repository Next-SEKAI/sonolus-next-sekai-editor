import {
    SkinSpriteName,
    type ServerItemDetails,
    type ServerItemList,
    type SkinData,
    type SkinItem,
} from '@sonolus/core'
import { parseGzippedJson, parseScp } from './scp'

export type Sprite = {
    u0: number
    v0: number
    u1: number
    v1: number
    transform?: number[]
    texture?: 0 | 1
}

export const toSpriteUv = (
    x: number,
    y: number,
    w: number,
    h: number,
    width: number,
    height: number,
) => {
    const insetX = Math.min(0.5, w / 2)
    const insetY = Math.min(0.5, h / 2)
    return {
        u0: (x + insetX) / width,
        v0: (y + insetY) / height,
        u1: (x + w - insetX) / width,
        v1: (y + h - insetY) / height,
    }
}

export type LoadedSkin = {
    title: string
    interpolation: boolean
    texture: ImageBitmap
    skin: PreviewSkin
}

type SpriteGetter = (name: string) => Sprite | undefined

export const loadSkinFromScp = async (buffer: ArrayBuffer): Promise<LoadedSkin> => {
    const scp = parseScp(buffer)

    const list = scp.getJson<ServerItemList<SkinItem>>('sonolus/skins/list')
    const item = list?.items[0]
    if (!item) throw new Error('No skin found in scp file')

    const details = scp.getJson<ServerItemDetails<SkinItem>>(`sonolus/skins/${item.name}`)
    const skinItem = details?.item ?? item

    const dataRaw = skinItem.data.url ? scp.get(skinItem.data.url) : undefined
    if (!dataRaw) throw new Error('Missing skin data in scp file')
    const data = parseGzippedJson<SkinData>(dataRaw)

    const textureRaw = skinItem.texture.url ? scp.get(skinItem.texture.url) : undefined
    if (!textureRaw) throw new Error('Missing skin texture in scp file')
    const texture = await createImageBitmap(new Blob([new Uint8Array(textureRaw)]), {
        premultiplyAlpha: 'premultiply',
        colorSpaceConversion: 'none',
    })

    const sprites = new Map<string, Sprite>()
    for (const sprite of data.sprites) {
        if (sprites.has(sprite.name)) continue

        sprites.set(sprite.name, {
            ...toSpriteUv(sprite.x, sprite.y, sprite.w, sprite.h, data.width, data.height),
            transform: toTransform(sprite.transform),
        })
    }

    return {
        title: skinItem.title,
        interpolation: data.interpolation,
        texture,
        skin: resolveSkin((name) => sprites.get(name)),
    }
}

const transformKeys = ['x1', 'x2', 'x3', 'x4', 'y1', 'y2', 'y3', 'y4'] as const

const toTransform = (transform: SkinData['sprites'][number]['transform']) => {
    const matrix: number[] = []
    let isIdentity = true

    for (const [i, out] of transformKeys.entries()) {
        const expression = transform[out] as Partial<Record<string, number>> | undefined
        for (const [j, key] of transformKeys.entries()) {
            const value = expression?.[key] ?? 0
            matrix.push(value)
            if (value !== (i === j ? 1 : 0)) isIdentity = false
        }
    }

    return isIdentity ? undefined : matrix
}

export type BodyRenderType = 'normal' | 'slim' | 'normalFallback' | 'slimFallback'

export type BodySpriteSet = {
    renderType: BodyRenderType
    left?: Sprite
    middle?: Sprite
    right?: Sprite
}

export type ArrowSpriteSet = {
    fallback: boolean
    up: (Sprite | undefined)[]
    upLeft: (Sprite | undefined)[]
    down: (Sprite | undefined)[]
    downLeft: (Sprite | undefined)[]
}

export type NoteSpriteSet = {
    body: BodySpriteSet
    arrow: ArrowSpriteSet
    tick?: Sprite
    slot?: Sprite
    slotGlow?: Sprite
}

export type ActiveConnectionSpriteSet = {
    normal?: Sprite
    active?: Sprite
}

export type JudgmentSpriteSet = {
    background?: Sprite
    gradient?: Sprite
    edge?: Sprite
    edgeLeft?: Sprite
    center?: Sprite
}

export type PreviewSkin = {
    cover?: Sprite

    lane?: Sprite
    judgmentLine?: Sprite
    stageLeftBorder?: Sprite
    stageRightBorder?: Sprite

    laneBackground?: Sprite
    laneDivider?: Sprite
    stageBorder?: Sprite

    judgments: JudgmentSpriteSet[]

    sekaiStage?: Sprite

    simLine?: Sprite

    normalNote: NoteSpriteSet
    slideNote: NoteSpriteSet
    flickNote: NoteSpriteSet
    downFlickNote: NoteSpriteSet
    criticalNote: NoteSpriteSet
    criticalSlideNote: NoteSpriteSet
    criticalFlickNote: NoteSpriteSet
    criticalDownFlickNote: NoteSpriteSet
    traceNote: NoteSpriteSet
    traceFlickNote: NoteSpriteSet
    traceDownFlickNote: NoteSpriteSet
    criticalTraceNote: NoteSpriteSet
    criticalTraceFlickNote: NoteSpriteSet
    criticalTraceDownFlickNote: NoteSpriteSet
    normalSlideTickNote: NoteSpriteSet
    criticalSlideTickNote: NoteSpriteSet
    damageNote: NoteSpriteSet

    activeSlideConnector: ActiveConnectionSpriteSet
    criticalActiveSlideConnector: ActiveConnectionSpriteSet
    damageSlideConnector: ActiveConnectionSpriteSet
    activeSlideConnectorSlotGlow?: Sprite
    criticalActiveSlideConnectorSlotGlow?: Sprite

    guides: (Sprite | undefined)[]
}

const emptyArrowSpriteSet: ArrowSpriteSet = {
    fallback: true,
    up: [],
    upLeft: [],
    down: [],
    downLeft: [],
}

const emptyBodySpriteSet: BodySpriteSet = {
    renderType: 'normalFallback',
}

const resolveSkin = (get: SpriteGetter): PreviewSkin => {
    const first = (...names: string[]) => {
        for (const name of names) {
            const sprite = get(name)
            if (sprite) return sprite
        }
        return undefined
    }

    const body = (renderType: 'normal' | 'slim', prefix: string): BodySpriteSet | undefined => {
        const middle = get(`${prefix} Middle`)
        if (!middle) return

        return {
            renderType,
            left: get(`${prefix} Left`),
            middle,
            right: get(`${prefix} Right`),
        }
    }

    const bodyFallback = (
        renderType: 'normalFallback' | 'slimFallback',
        name: string,
    ): BodySpriteSet | undefined => {
        const middle = get(name)
        if (!middle) return

        return {
            renderType,
            middle,
        }
    }

    const firstBody = (...sets: (BodySpriteSet | undefined)[]) =>
        sets.find((set) => set) ?? emptyBodySpriteSet

    const arrowGroup = (prefix: string) => {
        const sprites = [1, 2, 3, 4, 5, 6].map((i) => get(`${prefix} ${i}`))
        return sprites[0] ? sprites : undefined
    }

    const arrows = (prefix: string): ArrowSpriteSet | undefined => {
        const up = arrowGroup(`${prefix} Up`)
        if (!up) return

        return {
            fallback: false,
            up,
            upLeft: arrowGroup(`${prefix} Up Left`) ?? [],
            down: arrowGroup(`${prefix} Down`) ?? [],
            downLeft: arrowGroup(`${prefix} Down Left`) ?? [],
        }
    }

    const arrowsFallback = (name: string): ArrowSpriteSet | undefined => {
        const sprite = get(name)
        if (!sprite) return

        return {
            fallback: true,
            up: [sprite],
            upLeft: [],
            down: [],
            downLeft: [],
        }
    }

    const firstArrows = (...sets: (ArrowSpriteSet | undefined)[]) =>
        sets.find((set) => set) ?? emptyArrowSpriteSet

    const judgment = (color: string): JudgmentSpriteSet => ({
        background: first(`Sekai Judgment Background ${color}`, 'Sekai Judgment Background'),
        gradient: get(`Sekai Judgment Gradient ${color}`),
        edge: get(`Sekai Judgment Edge ${color}`),
        edgeLeft: first(`Sekai Judgment Edge Left ${color}`, `Sekai Judgment Edge ${color}`),
        center: get(`Sekai Judgment Center ${color}`),
    })

    const normalBody = body('normal', 'Sekai Normal Note')
    const cyanBody = body('normal', 'Sekai Note Cyan')
    const slideBody = body('normal', 'Sekai Slide Note')
    const greenBody = body('normal', 'Sekai Note Green')
    const flickBody = body('normal', 'Sekai Flick Note')
    const redBody = body('normal', 'Sekai Note Red')
    const downFlickBody = body('normal', 'Sekai Down Flick Note')
    const criticalBody = body('normal', 'Sekai Critical Note')
    const yellowBody = body('normal', 'Sekai Note Yellow')
    const criticalSlideBody = body('normal', 'Sekai Critical Slide Note')
    const criticalFlickBody = body('normal', 'Sekai Critical Flick Note')
    const criticalDownFlickBody = body('normal', 'Sekai Critical Down Flick Note')

    const cyanFallback = bodyFallback('normalFallback', SkinSpriteName.NoteHeadCyan)
    const greenFallback = bodyFallback('normalFallback', SkinSpriteName.NoteHeadGreen)
    const redFallback = bodyFallback('normalFallback', SkinSpriteName.NoteHeadRed)
    const yellowFallback = bodyFallback('normalFallback', SkinSpriteName.NoteHeadYellow)

    const traceGreenBody = body('slim', 'Sekai Trace Note Green')
    const traceRedBody = body('slim', 'Sekai Trace Note Red')
    const traceYellowBody = body('slim', 'Sekai Trace Note Yellow')
    const tracePurpleBody = body('slim', 'Sekai Trace Note Purple')
    const normalTraceBody = body('slim', 'Sekai Normal Trace Note')
    const traceFlickBody = body('slim', 'Sekai Trace Flick Note')
    const traceDownFlickBody = body('slim', 'Sekai Trace Down Flick Note')
    const criticalTraceBody = body('slim', 'Sekai Critical Trace Note')
    const criticalTraceFlickBody = body('slim', 'Sekai Critical Trace Flick Note')
    const criticalTraceDownFlickBody = body('slim', 'Sekai Critical Trace Down Flick Note')
    const damageBody = body('normal', 'Sekai Damage Note')

    const traceGreenSlimFallback = bodyFallback('slimFallback', SkinSpriteName.NoteHeadGreen)
    const traceRedSlimFallback = bodyFallback('slimFallback', SkinSpriteName.NoteHeadRed)
    const traceYellowSlimFallback = bodyFallback('slimFallback', SkinSpriteName.NoteHeadYellow)
    const tracePurpleSlimFallback = bodyFallback('slimFallback', SkinSpriteName.NoteHeadPurple)

    const flickArrows = arrows('Sekai Flick Arrow')
    const redArrows = arrows('Sekai Flick Arrow Red')
    const redArrowsFallback = arrowsFallback(SkinSpriteName.DirectionalMarkerRed)
    const criticalArrows = arrows('Sekai Critical Flick Arrow')
    const yellowArrows = arrows('Sekai Flick Arrow Yellow')
    const yellowArrowsFallback = arrowsFallback(SkinSpriteName.DirectionalMarkerYellow)

    const normalFlickArrows = firstArrows(flickArrows, redArrows, redArrowsFallback)
    const criticalFlickArrows = firstArrows(criticalArrows, yellowArrows, yellowArrowsFallback)

    return {
        cover: get(SkinSpriteName.StageCover),

        lane: get(SkinSpriteName.Lane),
        judgmentLine: get(SkinSpriteName.JudgmentLine),
        stageLeftBorder: get(SkinSpriteName.StageLeftBorder),
        stageRightBorder: get(SkinSpriteName.StageRightBorder),

        laneBackground: get('Sekai Lane Background'),
        laneDivider: get('Sekai Lane Divider'),
        stageBorder: get('Sekai Stage Border'),

        judgments: ['Neutral', 'Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Cyan', 'Black'].map(
            judgment,
        ),

        sekaiStage: get('Sekai Stage'),

        simLine: get(SkinSpriteName.SimultaneousConnectionNeutral),

        normalNote: {
            body: firstBody(normalBody, cyanBody, cyanFallback),
            arrow: emptyArrowSpriteSet,
            slot: first('Sekai Slot Normal', 'Sekai Slot Cyan'),
            slotGlow: first('Sekai Slot Glow Normal', 'Sekai Slot Glow Cyan'),
        },
        slideNote: {
            body: firstBody(slideBody, greenBody, greenFallback),
            arrow: emptyArrowSpriteSet,
            slot: first('Sekai Slot Slide', 'Sekai Slot Green'),
            slotGlow: first('Sekai Slot Glow Slide', 'Sekai Slot Glow Green'),
        },
        flickNote: {
            body: firstBody(flickBody, redBody, redFallback),
            arrow: normalFlickArrows,
            slot: first('Sekai Slot Flick', 'Sekai Slot Red'),
            slotGlow: first('Sekai Slot Glow Flick', 'Sekai Slot Glow Red'),
        },
        downFlickNote: {
            body: firstBody(downFlickBody, flickBody, redBody, redFallback),
            arrow: normalFlickArrows,
            slot: first('Sekai Slot Down Flick', 'Sekai Slot Flick', 'Sekai Slot Red'),
            slotGlow: first(
                'Sekai Slot Glow Down Flick',
                'Sekai Slot Glow Flick',
                'Sekai Slot Glow Red',
            ),
        },
        criticalNote: {
            body: firstBody(criticalBody, yellowBody, yellowFallback),
            arrow: emptyArrowSpriteSet,
            slot: first('Sekai Slot Critical', 'Sekai Slot Yellow'),
            slotGlow: first('Sekai Slot Glow Critical', 'Sekai Slot Glow Yellow'),
        },
        criticalSlideNote: {
            body: firstBody(criticalSlideBody, criticalBody, yellowBody, yellowFallback),
            arrow: emptyArrowSpriteSet,
            slot: first(
                'Sekai Slot Critical Slide',
                'Sekai Slot Yellow Slider',
                'Sekai Slot Critical',
                'Sekai Slot Yellow',
            ),
            slotGlow: first(
                'Sekai Slot Glow Critical Slide',
                'Sekai Slot Glow Yellow Slider Tap',
                'Sekai Slot Glow Critical',
                'Sekai Slot Glow Yellow',
            ),
        },
        criticalFlickNote: {
            body: firstBody(criticalFlickBody, criticalBody, yellowBody, yellowFallback),
            arrow: criticalFlickArrows,
            slot: first(
                'Sekai Slot Critical Flick',
                'Sekai Slot Yellow Flick',
                'Sekai Slot Critical',
                'Sekai Slot Yellow',
            ),
            slotGlow: first(
                'Sekai Slot Glow Critical Flick',
                'Sekai Slot Glow Yellow Flick',
                'Sekai Slot Glow Critical',
                'Sekai Slot Glow Yellow',
            ),
        },
        criticalDownFlickNote: {
            body: firstBody(
                criticalDownFlickBody,
                criticalFlickBody,
                criticalBody,
                yellowBody,
                yellowFallback,
            ),
            arrow: criticalFlickArrows,
            slot: first(
                'Sekai Slot Critical Down Flick',
                'Sekai Slot Critical Flick',
                'Sekai Slot Yellow Flick',
                'Sekai Slot Critical',
                'Sekai Slot Yellow',
            ),
            slotGlow: first(
                'Sekai Slot Glow Critical Down Flick',
                'Sekai Slot Glow Critical Flick',
                'Sekai Slot Glow Yellow Flick',
                'Sekai Slot Glow Critical',
                'Sekai Slot Glow Yellow',
            ),
        },
        traceNote: {
            body: firstBody(normalTraceBody, traceGreenBody, traceGreenSlimFallback),
            arrow: emptyArrowSpriteSet,
            tick: first(
                'Sekai Normal Trace Diamond',
                'Sekai Trace Diamond Green',
                SkinSpriteName.NoteTickGreen,
            ),
        },
        traceFlickNote: {
            body: firstBody(traceFlickBody, traceRedBody, traceRedSlimFallback),
            arrow: normalFlickArrows,
            tick: first(
                'Sekai Trace Flick Diamond',
                'Sekai Trace Diamond Red',
                SkinSpriteName.NoteTickRed,
            ),
        },
        traceDownFlickNote: {
            body: firstBody(traceDownFlickBody, traceFlickBody, traceRedBody, traceRedSlimFallback),
            arrow: normalFlickArrows,
            tick: first(
                'Sekai Trace Down Flick Diamond',
                'Sekai Trace Flick Diamond',
                'Sekai Trace Diamond Red',
                SkinSpriteName.NoteTickRed,
            ),
        },
        criticalTraceNote: {
            body: firstBody(criticalTraceBody, traceYellowBody, traceYellowSlimFallback),
            arrow: emptyArrowSpriteSet,
            tick: first(
                'Sekai Critical Trace Diamond',
                'Sekai Trace Diamond Yellow',
                SkinSpriteName.NoteTickYellow,
            ),
        },
        criticalTraceFlickNote: {
            body: firstBody(
                criticalTraceFlickBody,
                criticalTraceBody,
                traceYellowBody,
                traceYellowSlimFallback,
            ),
            arrow: criticalFlickArrows,
            tick: first(
                'Sekai Critical Trace Flick Diamond',
                'Sekai Critical Trace Diamond',
                'Sekai Trace Diamond Yellow',
                SkinSpriteName.NoteTickYellow,
            ),
        },
        criticalTraceDownFlickNote: {
            body: firstBody(
                criticalTraceDownFlickBody,
                criticalTraceFlickBody,
                criticalTraceBody,
                traceYellowBody,
                traceYellowSlimFallback,
            ),
            arrow: criticalFlickArrows,
            tick: first(
                'Sekai Critical Trace Down Flick Diamond',
                'Sekai Critical Trace Flick Diamond',
                'Sekai Critical Trace Diamond',
                'Sekai Trace Diamond Yellow',
                SkinSpriteName.NoteTickYellow,
            ),
        },
        normalSlideTickNote: {
            body: emptyBodySpriteSet,
            arrow: emptyArrowSpriteSet,
            tick: first(
                'Sekai Normal Slide Diamond',
                'Sekai Diamond Green',
                SkinSpriteName.NoteTickGreen,
            ),
        },
        criticalSlideTickNote: {
            body: emptyBodySpriteSet,
            arrow: emptyArrowSpriteSet,
            tick: first(
                'Sekai Critical Slide Diamond',
                'Sekai Diamond Yellow',
                SkinSpriteName.NoteTickYellow,
            ),
        },
        damageNote: {
            body: firstBody(damageBody, tracePurpleBody, tracePurpleSlimFallback),
            arrow: emptyArrowSpriteSet,
        },

        activeSlideConnector: resolveActiveConnection(
            get,
            'Sekai Normal Active Slide Connection Normal',
            'Sekai Normal Active Slide Connection Active',
            'Sekai Active Slide Connection Green',
            'Sekai Active Slide Connection Green Active',
            SkinSpriteName.NoteConnectionGreenSeamless,
        ),
        criticalActiveSlideConnector: resolveActiveConnection(
            get,
            'Sekai Critical Active Slide Connection Normal',
            'Sekai Critical Active Slide Connection Active',
            'Sekai Active Slide Connection Yellow',
            'Sekai Active Slide Connection Yellow Active',
            SkinSpriteName.NoteConnectionYellowSeamless,
        ),
        damageSlideConnector: {
            normal: first(
                'Sekai Damage Slide Connection',
                SkinSpriteName.NoteConnectionPurpleSeamless,
            ),
            active: first(
                'Sekai Damage Slide Connection Active',
                SkinSpriteName.NoteConnectionRedSeamless,
            ),
        },
        activeSlideConnectorSlotGlow: first(
            'Sekai Normal Slide Slot Glow',
            'Sekai Slot Glow Slide',
            'Sekai Slot Glow Green',
        ),
        criticalActiveSlideConnectorSlotGlow: first(
            'Sekai Critical Slide Slot Glow',
            'Sekai Slot Glow Critical Slide',
            'Sekai Slot Glow Yellow Slider Tap',
            'Sekai Slot Glow Critical',
            'Sekai Slot Glow Yellow',
        ),

        guides: [
            first('Sekai Guide Neutral', SkinSpriteName.NoteConnectionNeutralSeamless),
            first('Sekai Guide Red', SkinSpriteName.NoteConnectionRedSeamless),
            first('Sekai Guide Green', SkinSpriteName.NoteConnectionGreenSeamless),
            first('Sekai Guide Blue', SkinSpriteName.NoteConnectionBlueSeamless),
            first('Sekai Guide Yellow', SkinSpriteName.NoteConnectionYellowSeamless),
            first('Sekai Guide Purple', SkinSpriteName.NoteConnectionPurpleSeamless),
            first('Sekai Guide Cyan', SkinSpriteName.NoteConnectionCyanSeamless),
            first('Sekai Guide Black', SkinSpriteName.NoteConnectionNeutralSeamless),
        ],
    }
}

const resolveActiveConnection = (
    get: SpriteGetter,
    normal: string,
    active: string,
    fallbackNormal: string,
    fallbackActive: string,
    seamlessFallback: string,
): ActiveConnectionSpriteSet => {
    const normalSprite = get(normal)
    if (normalSprite) {
        return {
            normal: normalSprite,
            active: get(active),
        }
    }

    const fallbackNormalSprite = get(fallbackNormal)
    if (fallbackNormalSprite) {
        return {
            normal: fallbackNormalSprite,
            active: get(fallbackActive),
        }
    }

    const seamless = get(seamlessFallback)
    return {
        normal: seamless,
        active: undefined,
    }
}
