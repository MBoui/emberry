<script lang="ts">
import { appWindow } from '@tauri-apps/api/window'

import { Router, Route } from "svelte-navigator";
import Titlebar from "./win/Titlebar.svelte";
import Login from "./nav/Login.svelte";
import Home from "./nav/Home.svelte";
import { onMount } from 'svelte';
import initStorage from './core/storage';

let isFocused = true;

// Tauri window events:
appWindow.listen("tauri://focus", () => isFocused = true);
appWindow.listen("tauri://blur", () => isFocused = false);

// Setup the user so it persists.
onMount(() => {
	initStorage();
});

</script>

<main class="{isFocused ? 'focused' : 'unfocused'}">

	<Titlebar />

	<div class="background">
		<Router primary={false}>
			<Route path="/"><Login /></Route>
			<Route path="home"><Home /></Route>
		</Router>
	</div>

</main>

<style lang="scss">
main {
	text-align: center;
	padding: 1em;
	max-width: 240px;
	margin: 0 auto;
	padding: 0;

	display: flex;
	flex-direction: column;

	.background {
		flex-grow: 1;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
}

@media (min-width: 640px) {
	main {
		max-width: none;
	}
}
</style>