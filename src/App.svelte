<script lang="ts">
import { listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'

import { Router, Route } from "svelte-navigator";
import Titlebar from "./win/Titlebar.svelte";
import Login from "./nav/Login.svelte";
import Home from "./nav/Home.svelte";

let isFocused = true;

appWindow.listen("tauri://focus", () => isFocused = true);
appWindow.listen("tauri://blur", () => isFocused = false);

listen('onmessage', ev => {
    console.log((ev.payload as any).message);
});

</script>

<main class="{isFocused ? 'focused' : 'unfocused'}">

	<Titlebar />

	<div class="background">
		<Router>
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