<script>
  import { createEventDispatcher } from 'svelte';
  import * as _ from 'lamb';

  export let selections;
  const dispatch = createEventDispatcher();

  $: selectionsArray = _.pairs(selections);

  const filterCurrent = ({ type, value }, current, selection) => ({
    key: selection,
    type,
    value: value.filter(v => v !== current)
  })
</script>

{#each selectionsArray as [ key, selection ]}
  <ul>
  <span on:click={() => dispatch('toggleselection',  {key, type:selection.type, value: undefined}) }>{key}</span>
    {#each selection.value as item}
      <li
        on:click={() => dispatch('toggleselection',  filterCurrent(selection, item, key))}
      >
        {item}
      </li>
    {/each}
  </ul>
{/each}

<style lang="less">
  ul {
    display: flex;
    padding: 0;
    color: #333;
    padding: 10px;
    margin-bottom: 0px;
    list-style: none;
    border-radius: 30px;
    font-size: 0.9em;
    width: calc(100% - 500px);
    overflow-x: scroll;

    span {
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #ccc;
      margin-right: 10px;
      user-select: none;
      background: #eee;
      cursor: pointer;

      &:hover {
        background: #ccc;
      }
    }

    li {
      color: #333;
      display: flex;
      justify-content: center;
      flex-direction: column;
      padding: 4px 8px;
      border-radius: 20px;
      border: #ccc solid 1px;
      background: #fff;
      padding: 4px 10px;
      margin: 0 3px;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #eee;
      }
    }
  }
</style>