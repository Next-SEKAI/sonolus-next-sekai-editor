import { switchToStage } from '.'
import type { Command } from '..'
import { checkDynamicStages } from '../../../history/dynamicStages.ts'
import { i18n } from '../../../i18n'
import StageAllIcon from './StageAllIcon.vue'

export const stageAll: Command = {
    title: () => i18n.value.commands.stages.stageAll.title,
    icon: {
        is: StageAllIcon,
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        switchToStage(undefined)
    },
}
