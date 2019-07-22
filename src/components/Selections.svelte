<script>
  import { createEventDispatcher } from 'svelte';
  import * as _ from 'lamb';
  import arrowForward from 'ionicons/dist/ionicons/svg/ios-arrow-forward.svg';

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
<div class="container">
  <div class="icon left">
    <img src={arrowForward} >
  </div>
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
  <div class="icon right">
    <img src={arrowForward} >
  </div>
</div>

{/each}

<style lang="less">
  .container {
    width: calc(100% - 500px);
    position: relative;
    padding: 0 30px;
  }

  .icon {
    position: absolute;
    top: 0px;
    position: absolute;
    bottom: 0;
    margin: auto;
    display: flex;
    align-items: center;

    &.left {
      transform: rotate(180deg);
      left: 0;
    }

    &.right {
      left: unset;
      right: 0;
    }

    img {
      height: 50%;
    }
  }

  ul {
    display: flex;
    padding: 0;
    color: #333;
    padding: 10px;
    margin-bottom: 0px;
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
      margin: 0 3px;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #eee;
      }
    }
  }
</style>