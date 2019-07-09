<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';
  import compare from 'just-compare';

  import { Results, Paper, Event, Company } from '../../components/Results';

  import { screenStore, currentTab } from '../../stores/search.ts';
  import { SEARCH } from './_layout.svelte';

  const { checkDirty } = getContext(SEARCH);

  let previousSelectedItems;
  let changed;

  $: selectedItems = $screenStore[$currentTab].selected || [];
  $: {
    changed = selectedItems && !compare(previousSelectedItems, selectedItems);
    if (changed) {
      previousSelectedItems = selectedItems;
    }
  }
  $: isDirty = $screenStore && checkDirty();
</script>

<div class="content">
  {#if selectedItems}
  <div class="header">
    <p>Showing: {selectedItems.length} items</p>
    <ul>
      <li class="paper">Research</li>
      <li class="company">Companies</li>
      <li class="event">Social</li>
    </ul>
  </div>

  <Results dirty="{isDirty}" {changed}>
    {#each selectedItems as item}

      {#if item.type === 'paper'}
        <Paper data={item} />
      {:else if item.type === 'meetup group'}
        <Event data={item} />
      {:else if item.type === 'company'}
        <Company data={item} />
      {/if}

    {/each}
  </Results>
  {/if}
</div>

<style lang="less">
  .content {
    height: 100%;

    .header {
      padding: 0.5em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid lightgrey;
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
          background: limegreen;
          left: -20px;
          top: 7px
        }

        &.paper::before {
          background: #2f98f3;
        }

        &.event::before {
          background: orange;
        }

        &.paper::before {
          background: #2f98f3;
        }
      }
    }
  }
</style>
