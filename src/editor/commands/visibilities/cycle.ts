import { dynamicStagesVisibilityTypes, nonDynamicStagesVisibilityTypes } from '.'
import type { Command } from '..'
import { isDynamicStages } from '../../../history/dynamicStages.ts'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { view } from '../../view'
import CycleVisibilityIcon from './CycleVisibilityIcon.vue'

export const cycleVisibilities: Command = {
    title: () => i18n.value.commands.visibilities.cycle.title,
    icon: {
        is: CycleVisibilityIcon,
    },

    execute() {
        const visibilityTypes = isDynamicStages.value
            ? dynamicStagesVisibilityTypes
            : nonDynamicStagesVisibilityTypes

        const count = Object.values(visibilityTypes).filter((types) =>
            types.every((type) => view.visibilities[type]),
        ).length
        const index = Object.values(visibilityTypes).findIndex((types) =>
            types.every((type) => view.visibilities[type]),
        )

        const visibilities = { ...view.visibilities }

        if (count === Object.values(visibilityTypes).length) {
            for (const [i, types] of Object.values(visibilityTypes).entries()) {
                for (const type of types) {
                    visibilities[type] = i === 0
                }
            }
        } else if (count !== 1 || index === Object.values(visibilityTypes).length - 1) {
            for (const types of Object.values(visibilityTypes)) {
                for (const type of types) {
                    visibilities[type] = true
                }
            }
        } else {
            for (const [i, types] of Object.values(visibilityTypes).entries()) {
                for (const type of types) {
                    visibilities[type] = i === index + 1
                }
            }
        }

        view.visibilities = visibilities

        notify(() => i18n.value.commands.visibilities.cycle.cycled)
    },
}
