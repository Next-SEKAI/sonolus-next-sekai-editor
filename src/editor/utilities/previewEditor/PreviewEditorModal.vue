<script setup lang="ts">
import { saveAs } from 'file-saver'
import { ref } from 'vue'
import { bgm } from '../../../history/bgm'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import BaseModal from '../../../modals/BaseModal.vue'
import FileField from '../../../modals/form/FileField.vue'
import NumberField from '../../../modals/form/NumberField.vue'
import LoadingModal from '../../../modals/LoadingModal.vue'
import { loadBgm } from '../../../player'
import { formatTime } from '../../../utils/format'
import { remap, unlerp } from '../../../utils/math'
import { timeout } from '../../../utils/promise'

const buffer = ref(bgm.value.buffer)

const start = ref(0)
const end = ref(30)
const fadeStart = ref(1)
const fadeEnd = ref(1)

const onSelect = (file: File) => {
    void showModal(LoadingModal, {
        title: () => i18n.value.utilities.previewEditor.title,
        async *task() {
            yield () => i18n.value.utilities.previewEditor.loading

            const data = await file.arrayBuffer()

            yield () => i18n.value.utilities.previewEditor.decoding

            buffer.value = await loadBgm(data)
        },
    })
}

const onGenerate = () => {
    void showModal(LoadingModal, {
        title: () => i18n.value.utilities.previewEditor.title,
        async *task() {
            yield () => i18n.value.utilities.previewEditor.generating
            await timeout(50)

            if (!buffer.value) return

            const channels = [...Array(buffer.value.numberOfChannels).keys()].map((i) =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                buffer.value!.getChannelData(i),
            )

            const startSample = Math.floor(buffer.value.sampleRate * start.value)
            const startFadeSample = Math.floor(
                buffer.value.sampleRate * (start.value + fadeStart.value),
            )
            const endFadeSample = Math.floor(buffer.value.sampleRate * (end.value - fadeEnd.value))
            const endSample = Math.floor(buffer.value.sampleRate * end.value)

            let range = 1
            for (const channel of channels) {
                for (let i = startSample; i <= endSample; i++) {
                    range = Math.max(range, Math.abs(channel[i] ?? 0))
                }
            }

            const buffers: Uint8Array<ArrayBuffer>[] = []

            const { Mp3Encoder } = await import('@breezystack/lamejs')

            const encoder = new Mp3Encoder(
                buffer.value.numberOfChannels,
                buffer.value.sampleRate,
                192,
            )
            const chunkSize = 1152
            for (let i = startSample; i <= endSample; i += chunkSize) {
                const chunk = encoder.encodeBuffer(
                    ...(channels.map(
                        (channel) =>
                            new Int16Array(
                                channel.slice(i, i + chunkSize).map((value, j) => {
                                    if (i + j < startFadeSample) {
                                        value *= unlerp(startSample, startFadeSample, i + j)
                                    }

                                    if (i + j > endFadeSample) {
                                        value *= unlerp(endSample, endFadeSample, i + j)
                                    }

                                    return remap(-range, range, -32768, 32767, value)
                                }),
                            ),
                    ) as [Int16Array]),
                )
                if (chunk.length) buffers.push(chunk as never)
            }
            const chunk = encoder.flush()
            if (chunk.length) buffers.push(chunk as never)

            const blob = new Blob(buffers, {
                type: 'audio/mp3',
            })
            saveAs(blob, 'preview.mp3')
        },
    })
}
</script>

<template>
    <BaseModal :title="i18n.utilities.previewEditor.title">
        <div class="flex flex-col gap-2">
            <FileField
                :label="i18n.utilities.previewEditor.bgm"
                :value="buffer && formatTime(buffer.duration)"
                @select="onSelect"
            />
            <NumberField
                v-if="buffer"
                v-model="start"
                :label="i18n.utilities.previewEditor.start"
                :min="0"
                step="any"
            />
            <NumberField
                v-if="buffer"
                v-model="end"
                :label="i18n.utilities.previewEditor.end"
                :min="0"
                step="any"
            />
            <NumberField
                v-if="buffer"
                v-model="fadeStart"
                :label="i18n.utilities.previewEditor.fadeStart"
                :min="0"
                step="any"
            />
            <NumberField
                v-if="buffer"
                v-model="fadeEnd"
                :label="i18n.utilities.previewEditor.fadeEnd"
                :min="0"
                step="any"
            />
        </div>

        <div v-if="buffer" class="mt-4 flex justify-end">
            <button
                class="w-32 rounded-full bg-accent px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-button active:text-accent"
                @click="onGenerate"
            >
                {{ i18n.utilities.previewEditor.generate }}
            </button>
        </div>
    </BaseModal>
</template>
