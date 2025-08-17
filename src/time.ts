import { ref } from 'vue'

export const time = ref({
    now: 0,
    delta: 0,
})

const update = () => {
    const now = performance.now() / 1000

    time.value = {
        now,
        delta: now - time.value.now,
    }

    requestAnimationFrame(update)
}

update()
