<script lang="ts">
import { invoke } from '@tauri-apps/api/tauri';
import { useNavigate } from "svelte-navigator";
import { listen } from '@tauri-apps/api/event';
import { onMount } from 'svelte';

const navigate = useNavigate();
let name = '';

// Navigate to home on login.
listen('onlogin', () => {
    navigate('/home');
});

onMount(() => {
    if (sessionStorage.getItem("username") != 'null') navigate('/home');
});

const join = () => {
    if (sessionStorage.getItem("username") == 'null') {
        invoke('web_connect', { username: name });
    } else {
        navigate('/home');
    }
};

</script>

<div class="card">
    <h1>Emberry</h1>
    <p>Join the network!</p>
    <div class="login">
        <input type="text" placeholder="Enter your username..." bind:value={name}>
        <button on:click="{() => join()}">
            Join
        </button>
    </div>
</div>

<style lang="scss">
.card {
    width: 300px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1 {
        color: #222;
        font-size: 6em;
        font-weight: 900;
        margin: 0;
        outline: none;
        height: 120px;
        user-select: none;
    }

    p {
        color: #777;
        margin-top: -5px;
        font-family: CascadiaCode;
        user-select: none;
    }

    .login {
        display: flex;

        input {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            font-family: NotoSans;
        }

        button {
            background: #3d77e4;
            font-family: CascadiaCode;

            border-top-left-radius: 0;
            border-bottom-left-radius: 0;

            &:hover {
                background: #5a8ce9;
            }
        }
    }
}
</style>