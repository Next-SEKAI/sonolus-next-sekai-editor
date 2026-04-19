<script setup lang="ts">
import { computed } from 'vue'
import type { StageId, StageObject, Stages } from '../../../../../chart/stages'
import { pushState, state } from '../../../../../history'
import { stages } from '../../../../../history/stages'
import { i18n } from '../../../../../i18n'
import IsFromStartField from '../../../../../modals/form/IsFromStartField.vue'
import IsUntilEndField from '../../../../../modals/form/IsUntilEndField.vue'
import NameField from '../../../../../modals/form/NameField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'

const props = defineProps<{
    stageId: StageId
}>()

const createModel = <K extends keyof StageObject>(key: K) =>
    computed({
        get: () => {
            const object = stages.value.get(props.stageId)
            if (!object) throw new Error('Unexpected missing stage')

            return object[key]
        },
        set: (value) => {
            const object = stages.value.get(props.stageId)
            if (!object) throw new Error('Unexpected missing stage')

            const newObject = { ...object, [key]: value }

            const newStages: Stages = new Map(stages.value)
            newStages.set(props.stageId, newObject)

            pushState(
                interpolate(
                    () => i18n.value.commands.manageStages.modal.properties.modal.edited,
                    newObject.name,
                ),
                {
                    ...state.value,
                    stages: newStages,
                },
            )

            notify(
                interpolate(
                    () => i18n.value.commands.manageStages.modal.properties.modal.edited,
                    newObject.name,
                ),
            )
        },
    })

const name = createModel('name')
const isFromStart = createModel('isFromStart')
const isUntilEnd = createModel('isUntilEnd')
</script>

<template>
    <PropertiesModal :title="i18n.commands.manageStages.modal.properties.modal.title">
        <NameField v-model="name" />
        <IsFromStartField v-model="isFromStart" />
        <IsUntilEndField v-model="isUntilEnd" />
    </PropertiesModal>
</template>
