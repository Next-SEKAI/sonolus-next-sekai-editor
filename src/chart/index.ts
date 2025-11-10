export type Chart = {
    bpms: BpmObject[]
    groupCount: number
    timeScales: TimeScaleObject[]
    slides: NoteObject[][]
}

export type BpmObject = {
    beat: number
    bpm: number
}

export type TimeScaleEase = 'none' | 'linear'

export type TimeScaleObject = {
    group: number
    beat: number
    timeScale: number
    skip: number
    ease: TimeScaleEase
    hideNotes: boolean
}

export type NoteType = 'default' | 'trace' | 'anchor' | 'damage' | 'forceTick' | 'forceNonTick'

export type FlickDirection =
    | 'none'
    | 'up'
    | 'upLeft'
    | 'upRight'
    | 'down'
    | 'downLeft'
    | 'downRight'

export type NoteSfx =
    | 'default'
    | 'none'
    | 'normalTap'
    | 'criticalTap'
    | 'normalFlick'
    | 'criticalFlick'
    | 'normalTrace'
    | 'criticalTrace'
    | 'normalTick'
    | 'criticalTick'
    | 'damage'

export type ConnectorType = 'active' | 'guide'

export type ConnectorEase = 'linear' | 'in' | 'out' | 'inOut' | 'outIn' | 'none'

export type ConnectorGuideColor =
    | 'neutral'
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'purple'
    | 'cyan'
    | 'black'

export type NoteObject = {
    group: number
    beat: number
    noteType: NoteType
    isAttached: boolean
    left: number
    size: number
    isCritical: boolean
    flickDirection: FlickDirection
    isFake: boolean
    sfx: NoteSfx
    isConnectorSeparator: boolean
    connectorType: ConnectorType
    connectorEase: ConnectorEase
    connectorActiveIsCritical: boolean
    connectorActiveIsFake: boolean
    connectorGuideColor: ConnectorGuideColor
    connectorGuideAlpha: number
}
