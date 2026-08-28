import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{ path: '/', redirect: '/painel' },
	{
		path: '/painel',
		name: 'painel',
		component: () => import('../views/PainelView.vue'),
		meta: { title: 'Painel', icon: 'mdi-view-dashboard-outline' },
	},
	{
		path: '/dashboard',
		name: 'dashboard',
		component: () => import('../views/DashboardView.vue'),
		meta: { title: 'Dashboard', icon: 'mdi-chart-box-outline' },
	},
	{
		path: '/categorias',
		name: 'categorias',
		component: () => import('../views/CategoriasView.vue'),
		meta: { title: 'Categoria', icon: 'mdi-tag-multiple-outline' },
	},
	{
		path: '/status',
		name: 'status',
		component: () => import('../views/StatusView.vue'),
		meta: { title: 'Status', icon: 'mdi-format-list-bulleted-type' },
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
