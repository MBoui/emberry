<script lang="ts">
import { Router, Route } from "svelte-navigator";
import Titlebar from "./win/Titlebar.svelte";
import Login from "./nav/Login.svelte";
import Home from "./nav/Home.svelte";

import { appWindow } from '@tauri-apps/api/window'

let isFocused = true;

appWindow.listen("tauri://focus", () => isFocused = true);
appWindow.listen("tauri://blur", () => isFocused = false);

</script>

<main class="{isFocused ? 'focused' : 'unfocused'}">

	<Titlebar />

	<div class="background">
		<Router>
			<Route path="/"><Login /></Route>
			<Route path="home"><Home /></Route>
		</Router>

		<!-- <div class="card">
			<h1>CodeX</h1>
			<p>To open a folder press Ctrl + O</p>
		</div> -->
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

		// .card {
		// 	width: 300px;
		// 	height: 200px;

		// 	h1 {
		// 		color: #222;
		// 		font-family: 'Inter', sans-serif;
		// 		font-size: 4em;
		// 		margin: 0;
		// 	}

		// 	p {
		// 		color: #777;
		// 	}
		// }
	}
}

@media (min-width: 640px) {
	main {
		max-width: none;
	}
}
</style>