import DamageBody from './DamageBody.vue'
import NoneBody from './NoneBody.vue'
import SingleBody from './SingleBody.vue'
import TraceBody from './TraceBody.vue'

export const bodyComponents = {
    none: NoneBody,
    damage: DamageBody,
    trace: TraceBody,
    single: SingleBody,
}
