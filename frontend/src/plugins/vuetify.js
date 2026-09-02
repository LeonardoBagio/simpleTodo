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
		background: '#e5e5e5',
		surface: '#ffffff',
		'surface-bright': '#ffffff',
		primary: '#1a1a1a',
		'primary-darken-1': '#000000',
		...lamps,
		'on-surface': '#1a1a1a',
		'on-background': '#1a1a1a',
	},
};

const portfolioDark = {
	dark: true,
	colors: {
		background: '#131417',
		surface: '#1d1f23',
		'surface-bright': '#26282d',
		primary: '#ececed',
		'primary-darken-1': '#ffffff',
		...lamps,
		'on-surface': '#ececed',
		'on-background': '#ececed',
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
