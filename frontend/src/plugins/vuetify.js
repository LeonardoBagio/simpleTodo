import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const light = {
	dark: false,
	colors: {
		background: '#eef0f4',
		surface: '#ffffff',
		'surface-bright': '#f7f8fb',
		primary: '#5b5bd6',
		'primary-darken-1': '#4a4ac4',
		success: '#1f9d63',
		error: '#e0464b',
		'on-surface': '#171a21',
		'on-background': '#171a21',
	},
};

const dark = {
	dark: true,
	colors: {
		background: '#0c0e13',
		surface: '#14171f',
		'surface-bright': '#191d27',
		primary: '#7d7cf0',
		'primary-darken-1': '#9291f4',
		success: '#34c07d',
		error: '#f16b6f',
		'on-surface': '#eef1f7',
		'on-background': '#eef1f7',
	},
};

export default createVuetify({
	theme: {
		defaultTheme: 'light',
		themes: { light, dark },
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi },
	},
	defaults: {
		VBtn: {
			rounded: 'lg',
			style: 'text-transform: none; letter-spacing: -0.01em; font-weight: 700;',
		},
	},
});
