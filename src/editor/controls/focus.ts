import { onMounted, onUnmounted } from 'vue'
import { stopPlayer } from '../player'

const onBlur = () => {
    stopPlayer(false)
}

export const useFocusControl = () => {
    onMounted(() => {
        addEventListener('blur', onBlur)
    })

    onUnmounted(() => {
        removeEventListener('blur', onBlur)
    })
}
