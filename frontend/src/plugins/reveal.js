const reduceMotion =
	typeof window !== 'undefined' &&
	window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function mounted(el, binding) {
	el.classList.add('reveal');
	const delay = Number(binding.value) || 0;
	el.style.transitionDelay = `${delay}ms`;

	if (reduceMotion || typeof IntersectionObserver === 'undefined') {
		el.classList.add('is-visible');
		return;
	}

	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					obs.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.08 },
	);
	observer.observe(el);
	el._revealObserver = observer;
}

function unmounted(el) {
	el._revealObserver?.disconnect();
	delete el._revealObserver;
}

export default {
	install(app) {
		app.directive('reveal', { mounted, unmounted });
	},
};
