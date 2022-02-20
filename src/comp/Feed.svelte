<script lang="ts">
import { writeBinaryFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import * as store from "@/stores";
import { onMount } from "svelte";

let chat: Array<{ type: string; sender: string; content: any }> = [];
let dialog = false;

store.globalChat.subscribe((global) => {
  chat = global;
});

/**
 * Returns if the message is from a different user then the one before it.
 */
const isFirst = (index: number): boolean => {
  if (index == 0) {
    return true; // True if this is the first message in the chat.
  } else if (chat[index].sender != chat[index - 1].sender) {
    return true; // True if the message before is from another sender.
  }
  return false;
}

const downloadFile = (data: string, name: string) => {
  const bytes = base64ToArrayBuffer(data);
  
  if (dialog == false) {
    save({ defaultPath: name }).then((path) => {
      dialog = false;
      if (path) {
        writeBinaryFile({ path, contents: bytes });
      }
    });
  }
  dialog = true;
}

function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

onMount(() => {
  var scrollDiv = document.getElementsByClassName("feed")[0];
  scrollDiv.scrollTop = scrollDiv.scrollHeight;
});

</script>

<div class="feed">
  {#each chat as msg, i}
    <div class="{ isFirst(i) ? 'item first' : 'item' }" style="{ `--content:${'\'00:00\''}` }">
      <div class="user">
        <div class="avatar" />
        <div class="username">
          {msg.sender}
        </div>
      </div>

      {#if msg.type == 'msg'}
        <div class="content">{msg.content}</div>
      {/if}

      {#if msg.type == 'file'}
        <div class="content">
          Uploaded file: 
          {#if msg.content.data !== ''}
            <!-- svelte-ignore a11y-missing-attribute -->
            <button class="link" on:click={() => downloadFile(msg.content.data, msg.content.name)}>{msg.content.name}</button>
          {:else}
            {msg.content.name}
          {/if}
        </div>
      {/if}
     
    </div>
  {/each}
</div>

<style lang="scss">
  .feed {
    width: 100%;
    height: calc(100vh - 140px);
    margin-top: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    font-family: NotoSans;
    overflow-y: auto;

    .item {
      width: 100%;
      height: 20px;
      margin-top: 4px;

      color: #444444;

      display: flex;
      flex-direction: row;
      align-items: center;

      .user {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: fit-content;
        height: 20px;

        .avatar {
          width: 20px;
          height: 20px;

          border: 1px solid #3d3d3d;
          background-color: #2d2d2d;

          border-radius: 3px;
        }

        .username {
          width: fit-content;
          min-width: 50px;
          margin-left: 5px;
          margin-right: 10px;
          height: 10px;
          display: flex;
          align-items: center;
          
          color: #aaaaaa;
        }

        opacity: 0;
        user-select: none;
      }

      &.first {
        margin-top: 20px;

        position: relative;

        .user {
          opacity: 1;
          user-select: all;
        }

        &::before {
          content: " ";
          position: absolute;
          top: -11px;
          right: 0;
          width: calc(100% - 30px);
          height: 1px;
          border-bottom: 1px solid;
          border-color: inherit;
        }

        &::after {
          content: var(--content);
          position: absolute;
          top: -11px;
          left: 0;
          width: 100%;
          height: 1px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          font-size: 10px;
          color: #666666;
        }
      }

      .content {
        flex-grow: 1;
        height: 10px;
        display: flex;
        align-items: center;

        color: #eeeeee;
      }
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: #00000022;
      border-radius: 100px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 100px;
      background: #00000022;

      &:hover {
        background: #ffffff22;
      }
    }
  }
</style>
