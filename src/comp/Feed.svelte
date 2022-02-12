<script lang="ts">
import * as store from "@/stores";

let chat: Array<{ sender: string; content: string }> = [];

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

      <div class="content">{msg.content}</div>
    </div>
  {/each}
</div>

<style lang="scss">
  .feed {
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    font-family: NotoSans;

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
      }

      &.first {
        margin-top: 20px;

        position: relative;

        .user {
          opacity: 1;
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
  }
</style>
