import { createVisibility } from '.'
import { cameraEvent } from '../events/camera'

export const cameraEventVisibility = createVisibility('cameraEvent', cameraEvent.icon)
