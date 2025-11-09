import DamageBody from './DamageBody.vue'
import NoneBody from './NoneBody.vue'
import SingleCyanBody from './SingleCyanBody.vue'
import SingleGreenBody from './SingleGreenBody.vue'
import SingleRedBody from './SingleRedBody.vue'
import SingleYellowBody from './SingleYellowBody.vue'
import TraceGreenBody from './TraceGreenBody.vue'
import TraceRedBody from './TraceRedBody.vue'
import TraceYellowBody from './TraceYellowBody.vue'

export const bodyComponents = {
    none: NoneBody,
    damage: DamageBody,
    trace: {
        red: TraceRedBody,
        green: TraceGreenBody,
        yellow: TraceYellowBody,
    },
    single: {
        red: SingleRedBody,
        green: SingleGreenBody,
        yellow: SingleYellowBody,
        cyan: SingleCyanBody,
    },
}
