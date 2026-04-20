<script setup lang="ts">
import { addToStages, type StageId, type Stages } from '../../../../chart/stages'
import { pushState, state } from '../../../../history'
import { stages } from '../../../../history/stages'
import { getAllEntities } from '../../../../history/store'
import { i18n } from '../../../../i18n'
import { showModal } from '../../../../modals'
import BaseModal from '../../../../modals/BaseModal.vue'
import BaseField from '../../../../modals/form/BaseField.vue'
import type { Entity } from '../../../../state/entities'
import { removeNote } from '../../../../state/mutations/slides/note'
import { createTransaction } from '../../../../state/transaction'
import { interpolate } from '../../../../utils/interpolate'
import { notify } from '../../../notification'
import { updateViewLastActive, view } from '../../../view'
import DeleteIcon from './DeleteIcon.vue'
import HiddenIcon from './HiddenIcon.vue'
import MoveDownIcon from './MoveDownIcon.vue'
import MoveUpIcon from './MoveUpIcon.vue'
import PropertiesIcon from './PropertiesIcon.vue'
import StagePropertiesModal from './stageProperties/StagePropertiesModal.vue'
import VisibleIcon from './VisibleIcon.vue'

const onSwitch = (stageId: StageId, name: string) => {
    if (view.stageId === stageId) {
        view.stageId = undefined
        updateViewLastActive()

        notify(() => i18n.value.commands.manageStages.modal.switched.all)
    } else {
        view.stageId = stageId
        updateViewLastActive()

        notify(interpolate(() => i18n.value.commands.manageStages.modal.switched.one, name))
    }
}

const onMove = (stageId: StageId, name: string, offset: -1 | 1) => {
    const entries = [...stages.value.entries()]

    const aIndex = entries.findIndex(([id]) => id === stageId)
    const aEntry = entries[aIndex]
    if (!aEntry) return

    const bIndex = aIndex + offset
    const bEntry = entries[bIndex]
    if (!bEntry) return

    entries[aIndex] = bEntry
    entries[bIndex] = aEntry

    pushState(
        interpolate(() => i18n.value.commands.manageStages.modal.moved, name),
        {
            ...state.value,
            stages: new Map(entries),
        },
    )

    notify(interpolate(() => i18n.value.commands.manageStages.modal.moved, name))
}

const onProperties = (stageId: StageId) => {
    void showModal(StagePropertiesModal, {
        stageId,
    })
}

const onDelete = (stageId: StageId, name: string) => {
    const transaction = createTransaction(state.value)

    const removes: {
        [T in Entity as T['type']]: ((entity: T) => void) | undefined
    } = {
        bpm: undefined,
        timeScale: undefined,

        cameraEventJoint: undefined,
        cameraEventConnection: undefined,

        note(entity) {
            if (entity.stageId !== stageId) return

            removeNote(transaction, entity)
        },
        connector: undefined,
    }

    for (const entity of getAllEntities()) {
        removes[entity.type]?.(entity as never)
    }

    const newState = transaction.commit([])
    newState.stages = new Map(newState.stages)
    newState.stages.delete(stageId)
    if (!newState.stages.size) addToStages(newState.stages)

    pushState(
        interpolate(() => i18n.value.commands.manageStages.modal.deleted, name),
        newState,
    )
    view.entities = {
        hovered: [],
        creating: [],
    }

    notify(interpolate(() => i18n.value.commands.manageStages.modal.deleted, name))
}

const onAdd = () => {
    const newStages: Stages = new Map(stages.value)
    const [, name] = addToStages(newStages)

    pushState(
        interpolate(() => i18n.value.commands.manageStages.modal.added, name),
        {
            ...state.value,
            stages: newStages,
        },
    )

    notify(interpolate(() => i18n.value.commands.manageStages.modal.added, name))
}
</script>

<template>
    <BaseModal :title="i18n.commands.manageStages.modal.title">
        <div class="flex flex-col gap-2">
            <BaseField v-for="[stageId, { name }] in stages" :key="stageId" :label="name">
                <div class="flex gap-1">
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageStages.modal.switch"
                        @click="onSwitch(stageId, name)"
                    >
                        <component
                            :is="
                                !view.stageId || view.stageId === stageId ? VisibleIcon : HiddenIcon
                            "
                            class="size-4"
                        />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageStages.modal.moveUp"
                        @click="onMove(stageId, name, -1)"
                    >
                        <MoveUpIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageStages.modal.moveDown"
                        @click="onMove(stageId, name, 1)"
                    >
                        <MoveDownIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageStages.modal.properties.title"
                        @click="onProperties(stageId)"
                    >
                        <PropertiesIcon class="size-4" />
                    </button>
                    <button
                        class="rounded-full bg-button p-2 shadow-md transition-colors hover:shadow-accent active:bg-accent active:fill-button active:text-button"
                        :title="i18n.commands.manageStages.modal.delete"
                        @click="onDelete(stageId, name)"
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
                {{ i18n.commands.manageStages.modal.add }}
            </button>
        </div>
    </BaseModal>
</template>
