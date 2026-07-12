<script setup lang="ts">
import { clipboardEntries, setClipboardEntry } from '../../../clipboard/index.ts'
import { i18n } from '../../../i18n'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
</script>

<template>
    <BaseSidebar :title="i18n.tools.paste.sidebar.title">
        <template v-for="entry in clipboardEntries" :key="entry.name">
            <button
                v-if="entry.data"
                class="rounded-full bg-button px-4 py-1 shadow-md transition-colors hover:shadow-accent active:bg-accent active:text-button"
                @click="setClipboardEntry(entry)"
            >
                {{ entry.name }}
            </button>
        </template>
    </BaseSidebar>
</template>
