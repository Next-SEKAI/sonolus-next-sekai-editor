import './index.css'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.mount('#app')

import { showModal } from './modals'
import InfoModal from './modals/InfoModal.vue'

if (import.meta.env.PROD) {
    void showModal(InfoModal, {
        title: () => 'IMPORTANT',
        message: () =>
            'Next Sekai Editor is currently in alpha and is actively under development. Features may be incomplete, bugs are expected, and there will be continuous improvements.',
    })
}
