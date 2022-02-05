<script lang="ts">
import { useNavigate } from "svelte-navigator";

const navigate = useNavigate();
</script>

<div class="card">
    <h1>Flux</h1>
    <p>Join to the network!</p>
    <button class="join-button" on:click="{() => navigate('home')}">
        Join
    </button>
</div>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');

.card {
    width: 300px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1 {
        color: #222;
        font-family: 'Inter', sans-serif;
        font-size: 6em;
        font-weight: 900;
        margin: 0;
        outline: none;
    }

    p {
        color: #777;
        margin-top: -5px;
    }

    .join-button {
        width: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 14px;
        font-family: 'Inter', sans-serif;
        border-radius: 6px;
        border: none;

        color: #fff;
        background: #4885f7;
        user-select: none;
        cursor: pointer;

        &:hover {
            background: #5898f7;
        }
    }
}
</style>