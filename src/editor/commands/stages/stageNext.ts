import { switchToStage } from '.'
import type { Command } from '..'
import { checkDynamicStages } from '../../../history/dynamicStages.ts'
import { stages } from '../../../history/stages'
import { i18n } from '../../../i18n'
import { view } from '../../view'
import StageNextIcon from './StageNextIcon.vue'

export const stageNext: Command = {
    title: () => i18n.value.commands.stages.stageNext.title,
    icon: {
        is: StageNextIcon,
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        const ids = [...stages.value.keys()]
        const index = view.stageId ? ids.indexOf(view.stageId) : -1

        if (index < 0) {
            switchToStage(ids[0])
        } else if (index === ids.length - 1) {
            switchToStage(undefined)
        } else {
            switchToStage(ids[index + 1])
        }
    },
}
