import App from './App.svelte';
import initHooks from './core/hooks';

initHooks();

const app = new App({
	target: document.body
});

// Disable the default context menus:
document.addEventListener('contextmenu', event => event.preventDefault());

export default app;