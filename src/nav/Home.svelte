<script lang="ts">
import Users from '../comp/Users.svelte';
import Chat from '../comp/Chat.svelte';
import * as store from "@/stores";
import { onMount } from 'svelte';
import { useNavigate } from 'svelte-navigator';

const navigate = useNavigate();

let currentUser: { id: string, name: string };
// Handle refreshes:
onMount(() => {
    store.user.subscribe((user) => {
        currentUser = user;
    });
	if (!currentUser) navigate('/');
});

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
