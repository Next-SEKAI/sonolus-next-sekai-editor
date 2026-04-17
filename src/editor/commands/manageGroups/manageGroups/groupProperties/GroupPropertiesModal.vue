<script setup lang="ts">
import { computed } from 'vue'
import { pushState, state } from '../../../../../history'
import { groups } from '../../../../../history/groups'
import { i18n } from '../../../../../i18n'
import NameField from '../../../../../modals/form/NameField.vue'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import type { GroupId, GroupProperties } from '../../../../../state/groups'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'

const props = defineProps<{
    group: GroupId
}>()

const createModel = <K extends keyof GroupProperties>(key: K) =>
    computed({
        get: () => {
            const properties = groups.value.get(props.group)
            if (!properties) throw new Error('Unexpected missing group')

            return properties[key]
        },
        set: (value) => {
            const properties = groups.value.get(props.group)
            if (!properties) throw new Error('Unexpected missing group')

            const newProperties = { ...properties, [key]: value }

            const newGroups = new Map(groups.value)
            newGroups.set(props.group, newProperties)

            pushState(
                interpolate(
                    () => i18n.value.commands.manageGroups.modal.properties.modal.edited,
                    newProperties.name,
                ),
                {
                    ...state.value,
                    groups: newGroups,
                },
            )

            notify(
                interpolate(
                    () => i18n.value.commands.manageGroups.modal.properties.modal.edited,
                    newProperties.name,
                ),
            )
        },
    })

const name = createModel('name')
</script>

<template>
    <PropertiesModal :title="i18n.commands.manageGroups.modal.properties.modal.title">
        <NameField v-model="name" />
    </PropertiesModal>
</template>
