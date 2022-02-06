<script lang="ts">
import { latest_msg } from '@/stores';

let msg: String;

latest_msg.subscribe(value => {
    msg = value;
});
</script>

<div class="card">
    <h1>{msg}</h1>
</div>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap");

    .card {
        width: 300px;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        h1 {
            color: #dddddd;
            font-size: 1em;
            font-weight: 500;
            margin: 0;
            outline: none;
        }
    }
</style>
