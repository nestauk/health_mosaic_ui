<script>
  import Fallback from '../../components/Fallback.svelte';
  import { screenStore, currentTab } from '../../stores/search.ts';

  $: selectedItems = $screenStore[$currentTab].selected || [];


</script>

<div class="content">
  {#if selectedItems.length}
    <Fallback message="Select a facet." />
  {:else}
    <Fallback message="No results. Make a new search." />
  {/if}
</div>

<style lang="less">
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .header {
      padding: 0.5em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid lightgrey;
      .buttons {
        width: 56px;
        display: grid;
        height: 25px;
        grid-template-columns: 1fr 1fr;
        span {
          opacity: 0.6;
          cursor: pointer;
          &:hover {
            opacity: 1;
          }
        }
      }
    }

    ul {
      display: flex;
      list-style: none;

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
