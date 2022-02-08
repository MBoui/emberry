<script lang="ts">
import * as store from '@/stores';

let users: { id: string, name: string }[];

store.users.subscribe(value => {
    users = value;
});
</script>

<div class="user-list">
    {#if users.length > 0}
    {#each users as user}
        <div class="user">
            <div class="user-name">{user.name}</div>
            <div class="user-id">({user.id})</div>
        </div>
	{/each}
    {:else}
        no users online
    {/if}
</div>

<style lang="scss">
.user-list {
    width: 300px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .user {
        width: 100%;
        height: 40px;
        padding: 4px 12px;
        margin-bottom: 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;

        background-color: #3a3a3a;
        border-radius: 6px;

        .user-name {
            color: #bbbbbb;
            font-size: 1em;
        }

        .user-id {
            color: #6f6f6f;
            font-size: 0.75em;
        }
    }
}
</style>