<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';
  import compare from 'just-compare';

  import { Results, Paper, Event, Company } from '../../components/Results';
  import { AddCircle, RemoveCircle } from '../../components/Icons/'
  import { screenStore, currentTab } from '../../stores/search.ts';
  import { SEARCH } from './_layout.svelte';

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

  const openAll = () => items.forEach(v => v.open())
  const closeAll = () => items.forEach(v => v.close())
</script>

<div class="content">
  {#if selectedItems}
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
      <li class="paper">Research</li>
      <li class="company">Companies</li>
      <li class="event">Social</li>
    </ul>
  </div>

  <Results dirty="{isDirty}" {changed}>
    {#each selectedItems as item, i}

      {#if item.type === 'paper'}
        <Paper data={item} bind:this={items[i]}/>
      {:else if item.type === 'meetup group'}
        <Event data={item} bind:this={items[i]}/>
      {:else if item.type === 'company'}
        <Company data={item} bind:this={items[i]}/>
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
