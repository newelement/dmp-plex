import './bootstrap';
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

let plugin = createApp(App);
plugin.use(createPinia());
plugin.mount('#plexSettings');
