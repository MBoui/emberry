
<script>
import { appWindow } from '@tauri-apps/api/window'

/* Keep track of whether the window is focused */
let isFocused = true;
appWindow.listen("tauri://focus", () => isFocused = true);
appWindow.listen("tauri://blur", () => isFocused = false);

/* Keep track of whether the window is maximized */
let isMaximized = false;
appWindow.isMaximized().then(s => isMaximized = s);
appWindow.listen("tauri://resize", async () => isMaximized = await appWindow.isMaximized());

/* Functions for the different menu buttons */
const minimize = () => appWindow.minimize();
const maximize = () => appWindow.toggleMaximize();
const close = () => appWindow.close();

</script>

<div class="titlebar" focus={isFocused}>

    <div class="tabs" data-tauri-drag-region="true">

    </div>

    <div class="decorations">

        <div class="button" on:click={minimize}>
            <svg width="13.5" height="15" version="1.1" viewBox="0 0 5.2917 5.2917" xmlns="http://www.w3.org/2000/svg">
                <rect x=".7938" y="2.5135" width="3.7042" height=".26458" fill="currentColor" style="paint-order:markers fill stroke"/>
            </svg>
        </div>

        <div class="button" on:click={maximize}>
            {#if !isMaximized}
                <svg width="13.5" height="13.5" version="1.1" viewBox="0 0 5.2917 5.2917" xmlns="http://www.w3.org/2000/svg">
                    <path d="m0.79374 0.79374v3.7041h3.7041v-3.7041zm0.26458 0.26458h3.175v3.175h-3.175z" fill="currentColor" stroke-width=".26458" style="paint-order:markers fill stroke"/>
                </svg>
            {:else}
                <svg width="13.5" height="13.5" version="1.1" viewBox="0 0 5.2917 5.2917" xmlns="http://www.w3.org/2000/svg">
                    <path transform="scale(.26458)" d="m3 6v11h11v-11h-11zm1 1h9v9h-9v-9z" fill="currentColor" stroke-dashoffset="44.5" stroke-linecap="round" stroke-width="1.4385" style="paint-order:markers fill stroke"/>
                    <path transform="scale(.26458)" d="m6 3v4h1v-3h9v9h-3v1h4v-11h-11z" fill="currentColor" stroke-dashoffset="44.5" stroke-linecap="round" stroke-width="1.4385" style="paint-order:markers fill stroke"/>
                </svg>
            {/if}
        </div>

        <div class="button-close" on:click={close}>
            <svg width="14" height="14" version="1.1" viewBox="0 0 5.2917 5.2917" xmlns="http://www.w3.org/2000/svg">
                <rect transform="matrix(.7071 .70711 -.7071 .70711 0 0)" x="3.6093" y="-2.4322" width=".26458" height="4.8643" fill="currentColor" style="paint-order:markers fill stroke"/>
                <rect transform="matrix(-.7071 .70711 .7071 .70711 0 0)" x="-.13227" y="1.3095" width=".26458" height="4.8643" fill="currentColor" style="paint-order:markers fill stroke"/>
            </svg>
        </div>

    </div>

</div>

<style lang="scss">

.titlebar {
    width: 100%;
    height: 45px;

    display: flex;
    justify-content: space-between;

    .tabs {
        flex-grow: 1;
    }

    .decorations {
        width: calc(46.5px * 3);
        height: 100%;

        display: flex;

        .button {
            width: 46.5px;
            height: 45px;

            display: flex;
            justify-content: center;
            align-items: center;

            &:hover {
                background-color: #444 !important;
                color: #fff;
            }

            &-close {
                width: 46.5px;
                height: 45px;

                display: flex;
                justify-content: center;
                align-items: center;

                &:hover {
                    background-color: #e81123 !important;
                    color: #fff;
                }
            }
        }
    }
}

/** Change the titlebar based on focus */

.titlebar[focus=true] {
    background-color: #222;
    color: #fff;

    .decorations {

        .button {
            background-color: #222;

            &-close {
                background-color: #222;
            }
        }
    }
}

.titlebar[focus=false] {
    background-color: #222;
    color: #888;

    .decorations {

        .button {
            background-color: #222;

            &-close {
                background-color: #222;
            }
        }
    }
}

</style>