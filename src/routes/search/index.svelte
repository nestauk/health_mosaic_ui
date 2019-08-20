<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';
  import compare from 'just-compare';

  import Fallback from '../../components/Fallback.svelte'
  import { AddCircle, RemoveCircle } from '../../components/Icons/'
  import { Results, Paper, Event, Company } from '../../components/Results';

  import { NIH_type, CB_type, MU_type } from '../../config';
  import { screenStore, currentTab } from '../../stores/search.ts';
  import { countByTypeAsKeyValue } from '../../util/domain';
  import { SEARCH } from './_layout.svelte';

  const { checkDirty } = getContext(SEARCH);

  const labels = {
    [CB_type]: 'Companies',
    [MU_type]: 'Social',
    [NIH_type]: 'Research',
  };

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
  $: volumes = _.map(
    countByTypeAsKeyValue(selectedItems),
    ({key, value}) => ({key, text: `${labels[key]} (${value})`})
  );
  $: isDirty = $screenStore && checkDirty();

  const openAll = () => items.forEach(v => v.open())
  const closeAll = () => items.forEach(v => v.close())
</script>

<div class="content">
  {#if selectedItems.length}
  <div class="header">
    <p>Showing: {selectedItems.length} items</p>
    <div class="buttons">
      <span on:click={openAll}>
        <AddCircle />
      </span>
      <span on:click={closeAll}>
        <RemoveCircle />
        </span>
    </div>

    <ul>
      {#each volumes as {key, text}}
      <li class="{key}">{text}</li>
      {/each}
    </ul>
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
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;

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
