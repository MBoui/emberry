<script lang="ts">
import Users from '../comp/Users.svelte';
import Chat from '../comp/Chat.svelte';
</script>

<div class="home">
    <Users />
    <Chat />
</div>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap");

    .home {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
