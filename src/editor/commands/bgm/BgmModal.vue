<script setup lang="ts">
import { shallowReactive } from 'vue'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import FileField from '../../../modals/form/FileField.vue'
import FormModal from '../../../modals/form/FormModal.vue'
import NumberField from '../../../modals/form/NumberField.vue'
import LoadingModal from '../../../modals/LoadingModal.vue'
import { loadBgm } from '../../../player'
import { settings } from '../../../settings'
import type { Bgm } from '../../../state/bgm'
import { getFilename } from '../../../utils/file'
import { formatTime } from '../../../utils/format'
import { timeout } from '../../../utils/promise'
import { createWaveform } from '../../../waveform'

const props = defineProps<{
    bgm: Bgm
}>()

const emit = defineEmits<{
    close: [bgm?: Bgm]
}>()

const model = shallowReactive({
    ...props.bgm,
    offset: props.bgm.offset * 1000,
})

const onSelect = (file: File) => {
    void showModal(LoadingModal, {
        title: () => i18n.value.commands.bgm.title,
        async *task() {
            yield () => i18n.value.commands.bgm.modal.loading

            const data = await file.arrayBuffer()

            yield () => i18n.value.commands.bgm.modal.decoding

            const buffer = await loadBgm(data)

            yield () => i18n.value.commands.bgm.modal.generating
            await timeout(50)

            const waveform = await createWaveform(buffer, settings.waveform)

            model.filename = getFilename(file)
            model.buffer = buffer
            model.waveform = waveform
        },
    })
}

const onSubmit = () => {
    emit('close', {
        ...model,
        offset: model.offset / 1000,
    })
}
</script>

<template>
    <FormModal :title="i18n.commands.bgm.title" @close="$emit('close')" @submit="onSubmit">
        <FileField
            :label="i18n.commands.bgm.modal.file"
            :value="model.buffer && formatTime(model.buffer.duration)"
            @select="onSelect"
        />
        <NumberField v-model="model.offset" :label="i18n.commands.bgm.modal.offset" step="any" />
    </FormModal>
</template>
