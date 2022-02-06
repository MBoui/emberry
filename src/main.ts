import App from './App.svelte';

const app = new App({
	target: document.body
});

document.addEventListener('contextmenu', event => event.preventDefault());

export default app;