<script lang="ts">
import Users from '../comp/Users.svelte';
import { latest_msg } from '@/stores';

let msg: String = '';

latest_msg.subscribe(value => {
    msg = value;
});
</script>

<div class="home">
    <h1>{msg}</h1>
    <Users />
</div>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap");

    .home {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        h1 {
            width: 100%;
            color: #888888;
            font-size: 0.8em;
            font-weight: 500;
            margin: 0;
            margin-top: 6px;
            outline: none;
        }
    }
</style>
