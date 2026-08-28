import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const portfolio = {
	dark: false,
	colors: {
		background: '#e5e5e5',
		surface: '#ffffff',
		'surface-bright': '#ffffff',
		primary: '#1a1a1a',
		'primary-darken-1': '#000000',
		success: '#4bbd6b',
		warning: '#f2a41c',
		error: '#df5140',
		info: '#4a9fd4',
		'on-surface': '#1a1a1a',
		'on-background': '#1a1a1a',
	},
};

export default createVuetify({
	theme: {
		defaultTheme: 'portfolio',
		themes: { portfolio },
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi },
	},
});
