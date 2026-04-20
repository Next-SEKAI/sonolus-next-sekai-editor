import type { GroupId } from '../../../chart/groups'
import { groups } from '../../../history/groups'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { updateViewLastActive, view } from '../../view'

export const switchToGroup = (groupId: GroupId | undefined) => {
    view.groupId = groupId
    updateViewLastActive()

    notify(
        view.groupId === undefined
            ? () => i18n.value.commands.groups.switched.all
            : interpolate(
                  () => i18n.value.commands.groups.switched.one,
                  groups.value.get(view.groupId)?.name ?? '',
              ),
    )
}
