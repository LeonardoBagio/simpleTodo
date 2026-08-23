import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';

import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';

import '@mdi/font/css/materialdesignicons.css';
import './styles/app.css';

createApp(App).use(vuetify).mount('#app');
