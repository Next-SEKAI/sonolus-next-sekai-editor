import { commands, type Command, type CommandName } from '..'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { toolName, type ToolName } from '../../tools'
import EventIcon from './EventIcon.vue'

let prev: CommandName = 'cameraEvent'

export const event: Command = {
    title: interpolate(
        () => i18n.value.commands.events.title,
        () => i18n.value.events.event,
    ),
    icon: {
        is: EventIcon,
        props: {
            fill: '#fff',
        },
    },

    execute() {
        const next: Partial<Record<ToolName, CommandName>> = {
            cameraEvent: 'stageMaskEvent',
            stageMaskEvent: 'stagePivotEvent',
            stagePivotEvent: 'stageStyleEvent',
            stageStyleEvent: 'stageTransformEvent',
            stageTransformEvent: 'cameraEvent',
        }

        void commands[(prev = next[toolName.value] ?? prev)].execute()
    },
}
