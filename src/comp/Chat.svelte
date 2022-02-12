<script lang="ts">
import { invoke } from "@tauri-apps/api/tauri";
import * as store from "@/stores";
import Feed from "./Feed.svelte";

let input = "";
let user = "";

store.user.subscribe(value => {
  if (value) user = value.name;
  else user = undefined;
})

const sendMessage = () => {
  invoke('send_message', { data: input });
  store.globalChat.update(global => {
    global.push({ sender: user, content: input });
    return global;
  });
  input = "";
};
</script>

<div class="chat">
  <div class="chat-body">
    <Feed />
  </div>

  <div class="chat-footer">
    <div class="input">
      <div class="upload">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
          ><path d="M0 0h24v24H0z" fill="none" /><path
            d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
          /></svg
        >
      </div>

      <form on:submit|preventDefault={sendMessage}>
        <input type="text" bind:value={input} />
      </form>

      <div class="{input.length > 0 ? 'send valid' : 'send'}" on:click={sendMessage}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
          ><path d="M0 0h24v24H0z" fill="none" /><path
            d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
          /></svg
        >
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .chat {
    width: 100%;
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .chat-body {
      width: calc(100% - 30px);
      margin-left: 10px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;
    }

    .chat-footer {
      width: calc(100% - 10px);
      height: 41px;
      padding: 5px;

      .input {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        background-color: #3f3f3f;

        border-radius: 6px;

        .upload {
          width: 40px;
          height: 41px;
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
          cursor: pointer;
          border-right: solid 2px #333333;
          color: #6f6f6f;

          &:hover {
            color: #aaaaaa;
          }

          svg {
            width: 20px;
            height: 20px;
            margin: 10px;
          }
        }

        form {
          flex-grow: 1;

          input {
            width: 100%;

            outline: none !important;
            background: transparent !important;
            padding: 10px;
            font-size: 0.9em;
            font-family: NotoSans;
            color: #dddddd;
          }
        }

        .send {
          width: 40px;
          height: 41px;
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
          cursor: pointer;
          border-left: solid 2px #333333;
          color: #6f6f6f;

          &.valid {
            color: #aaaaaa;

            &:hover {
              color: #eeeeee;
            }
          }

          svg {
            width: 20px;
            height: 20px;
            margin: 10px;
          }
        }
      }
    }
  }
</style>
