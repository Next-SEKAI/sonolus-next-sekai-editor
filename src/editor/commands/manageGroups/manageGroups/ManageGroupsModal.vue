<script setup lang="ts">
import { addToGroups, type GroupId } from '../../../../chart/groups'
import { pushState, state } from '../../../../history'
import { groups } from '../../../../history/groups'
import { getAllEntities } from '../../../../history/store'
import { i18n } from '../../../../i18n'
import { showModal } from '../../../../modals'
import BaseModal from '../../../../modals/BaseModal.vue'
import BaseField from '../../../../modals/form/BaseField.vue'
import type { Entity } from '../../../../state/entities'
import { removeNote } from '../../../../state/mutations/slides/note'
import { removeTimeScale } from '../../../../state/mutations/timeScale'
import { createTransaction } from '../../../../state/transaction'
import { interpolate } from '../../../../utils/interpolate'
import { notify } from '../../../notification'
import { updateViewLastActive, view } from '../../../view'
import DeleteIcon from './DeleteIcon.vue'
import GroupPropertiesModal from './groupProperties/GroupPropertiesModal.vue'
import HiddenIcon from './HiddenIcon.vue'
import MoveDownIcon from './MoveDownIcon.vue'
import MoveUpIcon from './MoveUpIcon.vue'
import PropertiesIcon from './PropertiesIcon.vue'
import VisibleIcon from './VisibleIcon.vue'

const onSwitch = (groupId: GroupId, name: string) => {
    if (view.groupId === groupId) {
        view.groupId = undefined
        updateViewLastActive()

        notify(() => i18n.value.commands.manageGroups.modal.switched.all)
    } else {
        view.groupId = groupId
        updateViewLastActive()

        notify(interpolate(() => i18n.value.commands.manageGroups.modal.switched.one, name))
    }
}

const onMove = (groupId: GroupId, name: string, offset: -1 | 1) => {
    const entries = [...groups.value.entries()]

    const aIndex = entries.findIndex(([id]) => id === groupId)
    const aEntry = entries[aIndex]
    if (!aEntry) return

    const bIndex = aIndex + offset
    const bEntry = entries[bIndex]
    if (!bEntry) return

    entries[aIndex] = bEntry
    entries[bIndex] = aEntry

    pushState(
        interpolate(() => i18n.value.commands.manageGroups.modal.moved, name),
        {
            ...state.value,
            groups: new Map(entries),
        },
    )

    notify(interpolate(() => i18n.value.commands.manageGroups.modal.moved, name))
}

const onProperties = (groupId: GroupId) => {
    void showModal(GroupPropertiesModal, {
        groupId,
    })
}

const onDelete = (groupId: GroupId, name: string) => {
    const transaction = createTransaction(state.value)

    const removes: {
        [T in Entity as T['type']]: ((entity: T) => void) | undefined
    } = {
        bpm: undefined,
        timeScale(entity) {
            if (entity.groupId !== groupId) return

            removeTimeScale(transaction, entity)
        },

        note(entity) {
            if (entity.groupId !== groupId) return

            removeNote(transaction, entity)
        },
        connector: undefined,
    }

    for (const entity of getAllEntities()) {
        removes[entity.type]?.(entity as never)
    }

    const newState = transaction.commit([])

    newState.groups = new Map(newState.groups)
    newState.groups.delete(groupId)
    if (!newState.groups.size) addToGroups(newState.groups)

    pushState(
        interpolate(() => i18n.value.commands.manageGroups.modal.deleted, name),
        newState,
    )
    view.entities = {
        hovered: [],
        creating: [],
    }

    notify(interpolate(() => i18n.value.commands.manageGroups.modal.deleted, name))
}

const onAdd = () => {
    const newGroups = new Map(groups.value)
    const [, name] = addToGroups(newGroups)

    pushState(
        interpolate(() => i18n.value.commands.manageGroups.modal.added, name),
        {
            ...state.value,
            groups: newGroups,
        },
    )

    notify(interpolate(() => i18n.value.commands.manageGroups.modal.added, name))
}
</script>

<template>
    <BaseModal :title="i18n.commands.manageGroups.modal.title">
        <div class="flex flex-col gap-2">
            <BaseField v-for="[groupId, { name }] in groups" :key="groupId" :label="name">
                <div class="flex gap-1">
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.switch"
                        @click="onSwitch(groupId, name)"
                    >
                        <component
                            :is="
                                !view.groupId || view.groupId === groupId ? VisibleIcon : HiddenIcon
                            "
                            class="size-4"
                        />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.moveUp"
                        @click="onMove(groupId, name, -1)"
                    >
                        <MoveUpIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.moveDown"
                        @click="onMove(groupId, name, 1)"
                    >
                        <MoveDownIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.properties.title"
                        @click="onProperties(groupId)"
                    >
                        <PropertiesIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageGroups.modal.delete"
                        @click="onDelete(groupId, name)"
                    >
                        <DeleteIcon class="size-4" />
                    </button>
                </div>
            </BaseField>
        </div>
        <div class="flex justify-end">
            <button
                class="w-32 rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
                @click="onAdd"
            >
                {{ i18n.commands.manageGroups.modal.add }}
            </button>
        </div>
    </BaseModal>
</template>
