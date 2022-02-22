<script lang="ts">
import * as store from '@/stores';
import { invoke } from '@tauri-apps/api/tauri';

let users: { id: string, name: string }[];

store.users.subscribe(value => {
    users = value;
});

const peer_request = (uid: string) => {
    invoke('peer_request', { peerId: uid });
}
</script>

<div class="user-list">
    {#if users.length > 0}
    {#each users as user}
        <div class="user" on:click={() => peer_request(user.id)}>
            <div class="user-info">
                <div class="user-name">{user.name}</div>
                <div class="user-id">({user.id})</div>
            </div>
        </div>
	{/each}
    {:else}
        <div class="no-users">
            <svg width="64" height="64" version="1.1" viewBox="0 0 5.2917 5.2917" xmlns="http://www.w3.org/2000/svg">
                <path transform="scale(.26458)" d="m9.6289 1.8809a0.50005 0.50005 0 0 0-0.039062 0.0019531 0.50005 0.50005 0 0 0-0.4668 0.49414l0.0078125 3.8008-0.75977-0.60352a0.50209 0.50209 0 0 0-0.61914 0.78906l1.3574 1.0781v3.0117a0.50005 0.50005 0 0 0 0 0.007813 0.50005 0.50005 0 0 0 0 0.013671l0.041016 5.6113-0.23242-0.074219-1.0703-1.6543v-0.007813l-0.044922-0.16211-0.24414-0.8418 0.92383-0.78125 0.013672-0.007812a0.50104 0.50104 0 0 0-0.63477-0.77539l-0.013672 0.007812-0.074219 0.058594-0.35547 0.28125-0.125-2.3555a0.50005 0.50005 0 0 0-0.0078126-0.074219l0.28906-1.6465a0.50005 0.50005 0 0 0-0.55469-0.57422 0.50005 0.50005 0 0 0-0.43555 0.39844v0.0078125l-0.16211 0.87109-0.53125-0.49609a0.50134 0.50134 0 0 0-0.68555 0.73047l1.0625 0.99023 0.19922 3.166v0.023438a0.50005 0.50005 0 0 0 0.021484 0.095703 0.50005 0.50005 0 0 0 0 0.013672l0.33203 1.1309 0.089844 0.29492a0.50005 0.50005 0 0 0 0.0058594 0.013672l0.0078125 0.029297a0.50005 0.50005 0 0 0 0.029297 0.060547 0.50005 0.50005 0 0 0 0.029297 0.074218l0.62891 0.97266-0.5918-0.11719-0.39844-0.28711-0.82617-0.62891-1.7344-2.627 1.0625-0.90039 0.037109-0.029297 0.0078126-0.007813a0.50052 0.50052 0 0 0-0.64258-0.76758l-0.0078125 0.00586-0.59766 0.48828v-0.23633l0.087891-2.4727v-0.0078125l1.2402-2.0371 1.7578-1.2188 0.11719-0.080078 0.0078125-0.0078125a0.50005 0.50005 0 0 0-0.56836-0.82031l-1.2031 0.8125-0.044922-1.1953v-0.0078125a0.50005 0.50005 0 0 0-0.54492-0.47266 0.50005 0.50005 0 0 0-0.45898 0.50977l0.058594 1.957-0.89258 1.5059-0.58203-0.95312-0.10352-0.16992-0.0078125-0.0078126a0.50076 0.50076 0 0 0-0.85742 0.51758l0.0078126 0.0078125 1.0488 1.748-0.058594 2.4434-0.044922 1.248a0.50005 0.50005 0 0 0 0.021484 0.16211 0.50005 0.50005 0 0 0 0.074219 0.16992l1.373 2.1113 0.86328 1.1602 0.84961 0.62695 0.92969 0.49414 1.9336 0.36133 0.21484 0.044922 1.0156 0.025391 1.668-0.23047a0.50005 0.50005 0 0 0 0.021484-0.007812l0.007812-0.001953 0.73242-0.34375 0.23828-0.11328 0.42773-0.19922 0.80469-0.6875 1.75-2.043 1.6309-0.38477h0.007812a0.50005 0.50005 0 0 0-0.2207-0.97461h-0.007812l-0.074219 0.015625-0.9082 0.19922 0.36133-1.418a0.50005 0.50005 0 0 0 0.015625-0.14844l-0.037109-0.80469 0.53125-0.63477 0.46484-0.55273v-0.0078125a0.50005 0.50005 0 0 0-0.75976-0.64258h-0.007813l-0.41211 0.49609-0.082031 0.095703-0.45117-1.6172v-0.015625a0.50005 0.50005 0 0 0-0.072266-0.16211l-0.99023-1.3652 0.37695-0.72266 0.14844-0.28906v-0.0058593a0.50005 0.50005 0 0 0-0.4668-0.72461 0.50005 0.50005 0 0 0-0.41992 0.25781v0.0078125l-0.39844 0.75391-0.67188-0.50195-0.17773-0.14062h-0.007813a0.5005 0.5005 0 0 0-0.60352 0.79688h0.005859l1.2773 0.99609 0.015625 0.015625 0.52344 0.74609-1.0703 0.013672h-0.007813a0.50202 0.50202 0 0 0 0.015625 1.0039h0.007813 0.005859l1.6543-0.013672 0.56055 2.0664v0.0078125 0.0058594l0.015625 0.90234-0.25781 0.97266-0.39258-0.64062a0.50007 0.50007 0 0 0-0.85547 0.51562l0.007813 0.007813 0.81055 1.3438-1.5059 1.8457-0.375 0.43555-0.007812 0.007812-0.12695 0.058594-0.87695 0.40039 0.26562-0.40039 0.63476-0.92383a0.50005 0.50005 0 0 0 0.080078-0.18359l0.16992-0.87891a0.50005 0.50005 0 0 0 0-0.007813 0.50005 0.50005 0 0 0 0.007813-0.050781l0.19922-2.9082 0.007812-0.10352v-0.007812a0.50005 0.50005 0 0 0-0.49414-0.52344 0.50005 0.50005 0 0 0-0.50977 0.45703l-0.14844 2.0586-0.66406-0.50781-0.007813-0.007813a0.50005 0.50005 0 0 0-0.61133 0.78906l0.00586 0.007813 0.089843 0.066406 1.0781 0.84961v0.007813l-0.095703 0.46484-0.34766 0.51562-0.70117 1.0332-0.79883 0.41797-0.013672-5.2598 1.4316-1.1523a0.50005 0.50005 0 0 0-0.61914-0.78125l-0.8125 0.64258-0.007812-2.0898a0.50005 0.50005 0 0 0 0-0.029297 0.50005 0.50005 0 0 0 0.007812-0.044922l0.029297-2.959 1.373-1.0781a0.50226 0.50226 0 0 0-0.61914-0.79102l-0.79102 0.62109-0.00586-0.64258v-0.0078125a0.50005 0.50005 0 0 0-0.5-0.48828z" color="currentColor" color-rendering="auto" dominant-baseline="auto" fill="currentColor" image-rendering="auto" shape-rendering="auto" solid-color="#000000" stop-color="#000000" style="font-feature-settings:normal;font-variant-alternates:normal;font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;font-variant-position:normal;font-variation-settings:normal;inline-size:0;isolation:auto;mix-blend-mode:normal;shape-margin:0;shape-padding:0;text-decoration-color:#000000;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-orientation:mixed;text-transform:none;white-space:normal"/>
            </svg>
            <div class="title">no users online</div>
        </div>
    {/if}
</div>

<style lang="scss">
.user-list {
    width: 200px;
    min-width: 200px;
    height: calc(100% - 10px);
    padding: 5px 0px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    background-color: #2d2d2d;

    .user {
        width: 166px;
        height: 30px;
        padding: 4px 12px;
        margin-bottom: 2px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        cursor: pointer;

        background-color: #2d2d2d;
        border-radius: 4px;

        &:hover {
            background-color: #333333;
        }

        .user-info {
            flex-grow: 1;
            max-width: 166px;
            display: flex;
            user-select: none;
            overflow: hidden;

            .user-name {
                min-width: fit-content;
                max-width: 125px;
                color: #bbbbbb;
                font-size: 0.9em;
                font-weight: 500;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: start;
                overflow: hidden;
            }

            .user-id {
                flex-grow: 1;
                color: #6f6f6f;
                font-size: 0.65em;
                font-style: italic;
                margin-left: 3px;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: start;
                overflow: hidden;
            }
        }
    }

    .no-users {
        height: 100%;
        margin-bottom: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        user-select: none;

        svg {
            color: #57574c;
            animation: waggle 3s ease-in-out infinite alternate;
        }

        .title {
            color: #727264;
        }

        @keyframes waggle {
            0% {
                transform: rotate(25deg);
            }
            100% {
                transform: rotate(-25deg);
            }
        }
    }
}
</style>