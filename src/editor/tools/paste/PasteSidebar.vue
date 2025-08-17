<script setup lang="ts">
import { clipboardEntryNames, setToClipboardEntry } from '.'
import { i18n } from '../../../i18n'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
</script>

<template>
    <BaseSidebar :title="i18n.tools.paste.sidebar.title">
        <button
            v-for="name in clipboardEntryNames"
            :key="name"
            class="rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
            @click="setToClipboardEntry(name)"
        >
            {{ name }}
        </button>
    </BaseSidebar>
</template>
