import type { Component } from 'vue'
import { bgm } from './bgm'
import { bpm } from './bpm'
import { brush } from './brush'
import { copy } from './copy'
import { cut } from './cut'
import { deselect } from './deselect'
import { division } from './divisions'
import { divisionCustom } from './divisions/custom'
import { eraser } from './eraser'
import { flip } from './flip'
import { fullscreen } from './fullscreen'
import { groupAll } from './groups/groupAll'
import { groupNext } from './groups/groupNext'
import { groupPrev } from './groups/groupPrev'
import { help } from './help'
import { jumpDown } from './jumps/jumpDown'
import { jumpUp } from './jumps/jumpUp'
import { createNote, note } from './note'
import { open } from './open'
import { paste } from './paste'
import { play } from './play'
import { redo } from './redo'
import { reset } from './reset'
import { save } from './save'
import { scrollDown } from './scrolls/scrollDown'
import { scrollLeft } from './scrolls/scrollLeft'
import { scrollPageDown } from './scrolls/scrollPageDown'
import { scrollPageUp } from './scrolls/scrollPageUp'
import { scrollRight } from './scrolls/scrollRight'
import { scrollUp } from './scrolls/scrollUp'
import { select } from './select'
import { settings } from './settings'
import { createSlide, slide } from './slide'
import { snapping } from './snapping'
import { speedDown } from './speeds/speedDown'
import { speedUp } from './speeds/speedUp'
import { stop } from './stop'
import { timeScale } from './timeScale'
import { undo } from './undo'
import { utilities } from './utilities'
import { zoomXIn } from './zooms/zoomXIn'
import { zoomXOut } from './zooms/zoomXOut'
import { zoomYIn } from './zooms/zoomYIn'
import { zoomYOut } from './zooms/zoomYOut'

export type Command = {
    title: () => string
    icon: {
        is: Component
        props?: object
    }

    execute: () => void | Promise<void>
}

export const commands = {
    open,
    save,
    reset,
    utilities,

    play,
    stop,
    speedUp,
    speedDown,
    bgm,

    select,
    deselect,
    eraser,
    brush,
    flip,
    cut,
    copy,
    paste,
    undo,
    redo,

    note,
    note0: createNote(0),
    note1: createNote(1),
    note2: createNote(2),
    note3: createNote(3),

    slide,
    slide0: createSlide(0),
    slide1: createSlide(1),
    slide2: createSlide(2),
    slide3: createSlide(3),
    slide4: createSlide(4),

    bpm,
    timeScale,

    groupPrev,
    groupNext,
    groupAll,

    scrollLeft,
    scrollRight,
    scrollUp,
    scrollDown,
    scrollPageUp,
    scrollPageDown,
    jumpUp,
    jumpDown,

    division1: division(1),
    division2: division(2),
    division3: division(3),
    division4: division(4),
    division6: division(6),
    division8: division(8),
    division12: division(12),
    division16: division(16),
    divisionCustom,
    snapping,

    zoomXIn,
    zoomXOut,
    zoomYIn,
    zoomYOut,

    help,
    settings,
    fullscreen,
}

export type CommandName = keyof typeof commands

export const isCommandName = (name: string): name is CommandName => name in commands
