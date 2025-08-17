<script setup lang="ts">
import { saveAs } from 'file-saver'
import { ref } from 'vue'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import BaseModal from '../../../modals/BaseModal.vue'
import FileField from '../../../modals/form/FileField.vue'
import NumberField from '../../../modals/form/NumberField.vue'
import LoadingModal from '../../../modals/LoadingModal.vue'
import { createBlob } from '../../../utils/canvas'
import { timeout } from '../../../utils/promise'

const image = ref<HTMLImageElement>()

const size = ref(400)

const onSelect = (file: File) => {
    void showModal(LoadingModal, {
        title: () => i18n.value.utilities.coverEditor.title,
        async *task() {
            yield () => i18n.value.utilities.coverEditor.loading

            const url = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()

                reader.onload = (event) => {
                    const url = event.target?.result
                    if (typeof url === 'string') {
                        resolve(url)
                    } else {
                        reject(new Error('Failed to load cover'))
                    }
                }
                reader.onerror = () => {
                    reject(new Error('Failed to load cover'))
                }

                reader.readAsDataURL(file)
            })

            yield () => i18n.value.utilities.coverEditor.decoding

            image.value = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image()

                image.onload = () => {
                    resolve(image)
                }
                image.onerror = () => {
                    reject(new Error('Failed to decode cover'))
                }

                image.src = url
            })
        },
    })
}

const onGenerate = () => {
    void showModal(LoadingModal, {
        title: () => i18n.value.utilities.coverEditor.title,
        async *task() {
            yield () => i18n.value.utilities.coverEditor.generating
            await timeout(50)

            if (!image.value) return

            let sx = 0
            let sy = 0
            let sw = image.value.width
            let sh = image.value.height
            if (sw > sh) {
                sx = Math.floor((sw - sh) / 2)
                sw = sh
            } else if (sh > sw) {
                sy = Math.floor((sh - sw) / 2)
                sh = sw
            }

            const canvas = document.createElement('canvas')
            canvas.width = size.value
            canvas.height = size.value

            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Unexpected missing canvas context')

            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(image.value, sx, sy, sw, sh, 0, 0, size.value, size.value)

            const blob = await createBlob(canvas)
            saveAs(blob, 'cover.png')
        },
    })
}
</script>

<template>
    <BaseModal :title="i18n.utilities.coverEditor.title">
        <div class="flex flex-col gap-2">
            <FileField
                :label="i18n.utilities.coverEditor.cover"
                :value="image && `${image.width}x${image.height}`"
                @select="onSelect"
            />
            <NumberField
                v-if="image"
                v-model="size"
                :label="i18n.utilities.coverEditor.size"
                :min="1"
            />
        </div>

        <div v-if="image" class="mt-4 flex justify-end">
            <button
                class="w-32 rounded-full bg-accent px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-button active:text-accent"
                @click="onGenerate"
            >
                {{ i18n.utilities.coverEditor.generate }}
            </button>
        </div>
    </BaseModal>
</template>
