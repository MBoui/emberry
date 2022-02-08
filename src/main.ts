import App from './App.svelte';
import initHooks from './core/hooks';

initHooks();

const app = new App({
	target: document.body
});

//document.addEventListener('contextmenu', event => event.preventDefault());

export default app;