<script setup lang="ts">
import { modals, type Modal } from '.'

const onClick = (event: MouseEvent, modal: Modal) => {
    if (event.target !== event.currentTarget) return

    close(modal)
}

const close = (modal: Modal, result?: never) => {
    const index = modals.indexOf(modal)
    if (index !== -1) modals.splice(index, 1)

    modal.resolve(result)
}

const vOpen = {
    mounted(el: HTMLDialogElement) {
        el.showModal()
        setTimeout(() => {
            ;(
                el.lastElementChild?.querySelector('label') ??
                el.lastElementChild?.querySelector('button')
            )?.focus()
        }, 0)
    },
}
</script>

<template>
    <dialog
        v-for="modal in modals"
        :key="modal.id"
        v-open
        class="flex max-h-full w-full max-w-2xl flex-col rounded-xl bg-modal text-fg shadow-xl backdrop:bg-bg/75"
        @click="onClick($event, modal)"
        @close="close(modal)"
    >
        <component :is="modal.is" v-bind="modal.props" @close="close(modal, $event)" />
    </dialog>
</template>
