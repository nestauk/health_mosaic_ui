<script>
  export let useTop = false;
  export let parts = [];
  export let total = 0;
</script>

<div class="ItemsFigures">
  {#if total}
  <p>Showing {useTop ? 'top' : ''} {total} items</p>
  <ul>
    {#each parts as {key, text}}
    <li class="{key}">{text}</li>
    {/each}
  </ul>
  {/if}
</div>

<style lang="less">
  .ItemsFigures {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    ul {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-left: 2.4em;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          left: -20px;
          top: 7px
        }

        &.company::before {
          background: var(--color-type-company);
        }
        &.meetup::before {
          background: var(--color-type-event);
        }
        &.paper::before {
          background: var(--color-type-paper);
        }
      }
    }
  }
</style>
