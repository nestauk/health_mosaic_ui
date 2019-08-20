<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let items = [];
  export let activeItems = false;

  const itemSet = new Set(activeItems ? activeItems : items);

  function handleClick(item) {
    if (itemSet.has(item)) {
      itemSet.delete(item);
    } else {
      itemSet.add(item)
    }

  if (itemSet.size === 0) items.map( _item => itemSet.add(_item));

    itemSet = itemSet;
    dispatch('select', Array.from(itemSet))
  }
</script>

<div>
  {#each items as item}
    <button class:selected={itemSet.has(item)} on:click={() => handleClick(item)}>{item}</button>
  {/each}
</div>


<style lang="less">
  div {
    button {
      outline: none;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 16px;
      padding: 5px 10px;
      background: #eff3f6;
      background-image: linear-gradient(-180deg,#fafbfc,#eff3f6 90%);
      border: 1px solid #cececf;
      border-right: none;
      overflow: hidden;

      &:first-child {
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
        border-right: none;
      }

      &:last-child {
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
        border-right: solid 1px #cececf;
      }
      &:hover {
        background-color: #e6ebf1;
        background-image: linear-gradient(-180deg,#f0f3f6,#e6ebf1 90%);
      }
      &.selected {
        background: #333!important;
        color: #eee!important;
      }
    }
  }
</style>
