<script lang="ts">
import { client } from '@/stores';
import { useNavigate } from "svelte-navigator";
import { Client } from "../core/client";

const navigate = useNavigate();

const join = () => {
    new Client((instance: Client) => {
        client.set(instance);
        navigate('/home');
        console.log('test');
    });
};
</script>

<div class="card">
    <h1>Flux</h1>
    <p>Join the network!</p>
    <div class="login">
        <input type="text" placeholder="Enter your username...">
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
    }

    p {
        color: #777;
        margin-top: -5px;
        font-family: CascadiaCode;
    }

    .login {
        display: flex;

        input {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            font-family: CascadiaCode;
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