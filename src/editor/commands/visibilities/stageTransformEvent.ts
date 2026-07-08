import { createVisibility } from '.'
import { stageTransformEvent } from '../events/stage/transform'

export const stageTransformEventVisibility = createVisibility(
    'stageTransformEvent',
    stageTransformEvent.icon,
)
