<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { i18n } from '../i18n'
import BaseModal from './BaseModal.vue'

const props = defineProps<{
    title: () => string
    task: () => AsyncIterable<() => string> | Iterable<() => string>
}>()

const emit = defineEmits<{
    close: []
}>()

const message = ref(() => i18n.value.modals.loading.loading)

let isAborted = false
onMounted(async () => {
    try {
        for await (message.value of props.task()) {
            if (isAborted) return
        }

        emit('close')
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        message.value = () => `${error}`
    }
})

const onClose = () => {
    isAborted = true
    emit('close')
}
</script>

<template>
    <BaseModal :title="title()" @close="onClose">
        <span class="whitespace-break-spaces">{{ message() }}</span>
    </BaseModal>
</template>
