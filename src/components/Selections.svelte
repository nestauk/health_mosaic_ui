<script>
  import { createEventDispatcher } from 'svelte';
  import * as _ from 'lamb';
  import arrowForward from 'ionicons/dist/ionicons/svg/ios-arrow-forward.svg';

  export let selections;
  const dispatch = createEventDispatcher();

  $: selectionsArray = _.pairs(selections);

  const filterCurrent = ({ type, value }, current, selection) => {
    const newValue = value.filter(v => v !== current);

    return {
      key: selection,
      type,
      value: newValue.length ? newValue : undefined
    }
  }
</script>

{#if selectionsArray.length}
  <div class="container">
  <h2>Selections</h2>
    {#each selectionsArray as [ key, selection ]}
      <div class="title">
        <h3>{key}</h3>
        <span
          on:click={() => dispatch('toggleselection',  {key, type:selection.type, value: undefined}) }
        >
          x
        </span>
      </div>
      <ul>
      <!-- <span on:click={() => dispatch('toggleselection',  {key, type:selection.type, value: undefined}) }></span> -->
        {#each selection.value as item}
          <li
            on:click={() => dispatch('toggleselection',  filterCurrent(selection, item, key))}
          >
            {item}
          </li>
        {/each}
      </ul>
    {/each}
  </div>
{/if}

<style lang="less">
  .container {
    margin-top: 2rem;
  }
  h2 {
    font-size: 1.3rem;
  }

  .title {
    display: flex;
    align-items: center;

    h3 {
      margin:0 1rem 0 0;
      padding-left: 1rem;

    }

    span {
      border-radius: 2rem;
      display: block;
      width: 1.3em;
      height: 1.3em;
      background: #eee;
      font-size: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 0px 2px 0px;

      &:hover {
        background: #ccc;
      }
    }
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    color: #333;
    padding: 10px;
    margin: 0 0 1rem 0;
    list-style: none;
    border-radius: 30px;
    font-size: 0.9em;
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
      margin: 3px;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #eee;
      }
    }
  }
</style>
