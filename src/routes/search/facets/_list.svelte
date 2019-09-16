<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';
  import compare from 'just-compare';

  import Fallback from '../../../components/Fallback.svelte'
  import { AddCircle, RemoveCircle } from '../../../components/Icons/'
  import { Results, Paper, Event, Company } from '../../../components/Results';

  import { screenStore, currentTab } from '../../../stores/search.ts';
  import { SEARCH } from '../_layout.svelte';
  import { NIH_type, CB_type, MU_type } from '../../../config';

  const { checkDirty } = getContext(SEARCH);

  let previousSelectedItems;
  let changed;
  let items = [];

  $: selectedItems = $screenStore[$currentTab].selected || [];
  $: {
    changed = selectedItems && !compare(previousSelectedItems, selectedItems);
    if (changed) {
      previousSelectedItems = selectedItems;
    }
  }
  $: isDirty = $screenStore && checkDirty();

  const openAll = () => items.forEach(v => v.open());
  const closeAll = () => items.forEach(v => v.close());
</script>

<div
  class="List"
  class:dirty="{isDirty}"
>
  {#if selectedItems.length}
  <div class="header">
    <div class="buttons">
      <span on:click={openAll}>
        <AddCircle />
      </span>
      <span on:click={closeAll}>
        <RemoveCircle />
        </span>
      </div>
  </div>

  <Results dirty="{isDirty}" {changed}>
    {#each selectedItems as item, i}

      {#if item.type === NIH_type}
        <Paper data={item} bind:this={items[i]}/>
      {:else if item.type === MU_type}
        <Event data={item} bind:this={items[i]}/>
      {:else if item.type === CB_type}
        <Company data={item} bind:this={items[i]}/>
      {/if}

    {/each}
  </Results>

  {:else}
  <Fallback message="No results" />
  {/if}
</div>

<style lang="less">
  .List {
    height: 100%;
    display: flex;
    flex-direction: column;

    position: relative;

    .header {
      padding: 0.5em;
      display: flex;
      justify-content: center;
      align-items: center;

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

    &.dirty {
      /* use to disable events or so */
    }
  }
</style>
