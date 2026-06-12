import type { Command } from '..'
import { i18n } from '../../../i18n'
import type { EntityType } from '../../../state/entities'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view } from '../../view'
import VisibilityIcon from './VisibilityIcon.vue'

export const nonDynamicStagesVisibilityTypes = {
    note: ['note', 'connector'],
    timeScale: ['timeScale'],
    bpm: ['bpm'],
} satisfies Record<string, EntityType[]>

export const dynamicStagesVisibilityTypes = {
    note: ['note', 'connector'],
    cameraEvent: ['cameraEventJoint', 'cameraEventConnection'],
    stageMaskEvent: ['stageMaskEventJoint', 'stageMaskEventConnection'],
    stagePivotEvent: ['stagePivotEventJoint', 'stagePivotEventConnection'],
    stageStyleEvent: ['stageStyleEventJoint', 'stageStyleEventConnection'],
    timeScale: ['timeScale'],
    bpm: ['bpm'],
} satisfies Record<string, EntityType[]>

export const createVisibility = (
    key: keyof typeof dynamicStagesVisibilityTypes,
    props: object,
): Command => ({
    title: interpolate(
        () => i18n.value.commands.visibilities.toggle.title,
        () => i18n.value.commands.visibilities.toggle.types[key],
    ),
    icon: {
        is: VisibilityIcon,
        props: {
            ...props,
            get state() {
                return getIsVisible(key)
            },
        },
    },

    execute() {
        const visibilities = { ...view.visibilities }

        const visibility = !getIsVisible(key)
        for (const type of dynamicStagesVisibilityTypes[key]) {
            visibilities[type] = visibility
        }

        view.visibilities = visibilities

        notify(
            interpolate(
                () => i18n.value.commands.visibilities.toggle.toggled,
                () => i18n.value.commands.visibilities.toggle.types[key],
            ),
        )
    },
})

const getIsVisible = (key: keyof typeof dynamicStagesVisibilityTypes) =>
    dynamicStagesVisibilityTypes[key].some((type) => view.visibilities[type])
