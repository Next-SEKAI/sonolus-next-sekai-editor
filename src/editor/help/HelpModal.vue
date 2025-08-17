<script setup lang="ts">
import { i18n } from '../../i18n'
import BaseModal from '../../modals/BaseModal.vue'
import HelpSection from './HelpSection.vue'
</script>

<template>
    <BaseModal :title="i18n.help.modal.title">
        <HelpSection :title="i18n.help.modal.touchscreen.title">
            <li>{{ i18n.help.modal.touchscreen.tap }}</li>
            <li>{{ i18n.help.modal.touchscreen.drag }}</li>
            <li>{{ i18n.help.modal.touchscreen.scrollY }}</li>
            <li>{{ i18n.help.modal.touchscreen.scrollX }}</li>
            <li>{{ i18n.help.modal.touchscreen.zoomY }}</li>
            <li>{{ i18n.help.modal.touchscreen.zoomX }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.mouse.title">
            <li>{{ i18n.help.modal.mouse.tapPrimary }}</li>
            <li>{{ i18n.help.modal.mouse.dragPrimary }}</li>
            <li>{{ i18n.help.modal.mouse.tapSecondary }}</li>
            <li>{{ i18n.help.modal.mouse.dragSecondary }}</li>
            <li>{{ i18n.help.modal.mouse.scrollY }}</li>
            <li>{{ i18n.help.modal.mouse.scrollX }}</li>
            <li>{{ i18n.help.modal.mouse.zoomY }}</li>
            <li>{{ i18n.help.modal.mouse.zoomX }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.keyboard.title">
            <li>{{ i18n.help.modal.keyboard.single }}</li>
            <li>{{ i18n.help.modal.keyboard.multiple }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.selectTool.title">
            <li>{{ i18n.help.modal.selectTool.select }}</li>
            <li>{{ i18n.help.modal.selectTool.deselect }}</li>
            <li>{{ i18n.help.modal.selectTool.move }}</li>
            <li>{{ i18n.help.modal.selectTool.selectMultiple }}</li>
            <li>{{ i18n.help.modal.selectTool.ctrl }}</li>
            <li>{{ i18n.help.modal.selectTool.shift }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.eraserTool.title">
            <li>{{ i18n.help.modal.eraserTool.erase }}</li>
            <li>{{ i18n.help.modal.eraserTool.deselect }}</li>
            <li>{{ i18n.help.modal.eraserTool.eraseMultiple }}</li>
            <li>{{ i18n.help.modal.eraserTool.shift }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.brushTool.title">
            <li>{{ i18n.help.modal.brushTool.brush }}</li>
            <li>{{ i18n.help.modal.brushTool.deselect }}</li>
            <li>{{ i18n.help.modal.brushTool.brushMultiple }}</li>
            <li>{{ i18n.help.modal.brushTool.shift }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.pasteTool.title">
            <li>{{ i18n.help.modal.pasteTool.paste }}</li>
            <li>{{ i18n.help.modal.pasteTool.shift }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.noteTool.title">
            <li>{{ i18n.help.modal.noteTool.select }}</li>
            <li>{{ i18n.help.modal.noteTool.edit }}</li>
            <li>{{ i18n.help.modal.noteTool.add }}</li>
            <li>{{ i18n.help.modal.noteTool.move }}</li>
            <li>{{ i18n.help.modal.noteTool.ctrl }}</li>
            <li>{{ i18n.help.modal.noteTool.shift }}</li>
            <li>{{ i18n.help.modal.noteTool.properties }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.slideTool.title">
            <li>{{ i18n.help.modal.slideTool.select }}</li>
            <li>{{ i18n.help.modal.slideTool.edit }}</li>
            <li>{{ i18n.help.modal.slideTool.add }}</li>
            <li>{{ i18n.help.modal.slideTool.connect }}</li>
            <li>{{ i18n.help.modal.slideTool.move }}</li>
            <li>{{ i18n.help.modal.slideTool.ctrl }}</li>
            <li>{{ i18n.help.modal.slideTool.shift }}</li>
            <li>{{ i18n.help.modal.slideTool.properties }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.bpmTool.title">
            <li>{{ i18n.help.modal.bpmTool.select }}</li>
            <li>{{ i18n.help.modal.bpmTool.edit }}</li>
            <li>{{ i18n.help.modal.bpmTool.add }}</li>
            <li>{{ i18n.help.modal.bpmTool.move }}</li>
            <li>{{ i18n.help.modal.bpmTool.ctrl }}</li>
        </HelpSection>

        <HelpSection :title="i18n.help.modal.timeScaleTool.title">
            <li>{{ i18n.help.modal.timeScaleTool.select }}</li>
            <li>{{ i18n.help.modal.timeScaleTool.edit }}</li>
            <li>{{ i18n.help.modal.timeScaleTool.add }}</li>
            <li>{{ i18n.help.modal.timeScaleTool.move }}</li>
            <li>{{ i18n.help.modal.timeScaleTool.ctrl }}</li>
        </HelpSection>
    </BaseModal>
</template>
