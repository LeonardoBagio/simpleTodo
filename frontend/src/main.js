import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import reveal from './plugins/reveal';

import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';

import '@mdi/font/css/materialdesignicons.css';
import './styles/app.css';

createApp(App).use(vuetify).use(reveal).mount('#app');
