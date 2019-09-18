<script>
  import { createEventDispatcher } from 'svelte';
  import * as _ from 'lamb';
  import arrowForward from 'ionicons/dist/ionicons/svg/ios-arrow-forward.svg';
  import { XCircleIcon } from 'svelte-feather-icons';

  const dispatch = createEventDispatcher();

  export let selections;

  $: selectionsArray = _.pairs(selections);

  const formatCoords = coords => parseFloat(coords).toFixed(2);

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
          <XCircleIcon />
        </span>
      </div>
      <ul>
        {#if selection.type === 'within'}
          <li
            title="Remove selection"
            on:click={() => dispatch('toggleselection',  {key, type:selection.type, value: undefined})}
          >
            <p><strong>SW</strong> {formatCoords(selection.value[0][0])}°, {formatCoords(selection.value[0][1])}°
            <strong>NE</strong> {formatCoords(selection.value[1][0])}°, {formatCoords(selection.value[1][1])}°</p>
          </li>
        {:else}
          {#each selection.value as item}
            <li
              title="Remove selection"
              on:click={() => dispatch('toggleselection',  filterCurrent(selection, item, key))}
            >
              {item}
            </li>
          {/each}
        {/if}
      </ul>
    {/each}
  </div>
{/if}

<style lang="less">
  .container {
    margin-top: 2rem;
  }
  h2 {
    font-size: var(--size-sidebar-panel-title);
  }

  .title {
    display: flex;
    align-items: center;

    h3 {
      margin:0 1rem 0 0;
      padding-left: 1rem;
    }

    span {
      display: block;
      width: 1.2em;
      height: 1.2em;
      font-size: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      transform: translateY(1px);
      opacity: 0.6;
      cursor: pointer;

      &:hover {
        opacity: 1;
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

      p {
        margin: 0;
      }

      &:hover {
        background: #eee;
      }
    }
  }
</style>
