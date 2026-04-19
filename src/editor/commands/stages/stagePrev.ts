import { switchToStage } from '.'
import type { Command } from '..'
import { checkDynamicStages } from '../../../history/dynamicStages.ts'
import { stages } from '../../../history/stages'
import { i18n } from '../../../i18n'
import { view } from '../../view'
import StagePrevIcon from './StagePrevIcon.vue'

export const stagePrev: Command = {
    title: () => i18n.value.commands.stages.stagePrev.title,
    icon: {
        is: StagePrevIcon,
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        const ids = [...stages.value.keys()]
        const index = view.stageId ? ids.indexOf(view.stageId) : -1

        if (index < 0) {
            switchToStage(ids.at(-1))
        } else if (index === 0) {
            switchToStage(undefined)
        } else {
            switchToStage(ids[index - 1])
        }
    },
}
