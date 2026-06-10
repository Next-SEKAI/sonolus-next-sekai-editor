import type { StageId } from '../../../chart/stages'
import { stages } from '../../../history/stages'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { updateViewLastActive, view } from '../../view'

export const switchToStage = (stageId: StageId | undefined) => {
    view.stageId = stageId
    updateViewLastActive()

    notify(
        view.stageId === undefined
            ? () => i18n.value.commands.stages.switched.all
            : interpolate(
                  () => i18n.value.commands.stages.switched.one,
                  stages.value.get(view.stageId)?.name ?? '',
              ),
    )
}
