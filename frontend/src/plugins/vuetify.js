import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const lamps = {
	success: '#4bbd6b',
	warning: '#f2a41c',
	error: '#df5140',
	info: '#4a9fd4',
};

const portfolio = {
	dark: false,
	colors: {
		background: '#efecf8',
		surface: '#ffffff',
		'surface-bright': '#ffffff',
		primary: '#6c4bf2',
		'primary-darken-1': '#5a37e6',
		...lamps,
		'on-surface': '#1c1830',
		'on-background': '#1c1830',
	},
};

const portfolioDark = {
	dark: true,
	colors: {
		background: '#100c1e',
		surface: '#1a1633',
		'surface-bright': '#241f42',
		primary: '#7c5cfc',
		'primary-darken-1': '#9179ff',
		...lamps,
		'on-surface': '#f3f1fb',
		'on-background': '#f3f1fb',
	},
};

const initialTheme =
	typeof window !== 'undefined' && window.__ST_THEME__ === 'dark'
		? 'portfolioDark'
		: 'portfolio';

export default createVuetify({
	theme: {
		defaultTheme: initialTheme,
		themes: { portfolio, portfolioDark },
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi },
	},
});
