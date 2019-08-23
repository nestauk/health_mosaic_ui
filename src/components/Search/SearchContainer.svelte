<script context="module">
  export const RULESETS = {};
</script>

<script>
  import { setContext, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import { Sync } from '../Icons';
  import { ESIndices } from '../../config';
  import MultiToggle from '../MultiToggle.svelte';
  import { SearchDropdown } from './index.js';

  export let index;

  const rulesets = writable(new Map());
  const dispatch = createEventDispatcher();
  const search_indices= ['Research', 'Companies', 'Events'];

  const getIndex = key => Array.from($rulesets).findIndex(([_key]) => key === _key)

  setContext(RULESETS, {
    rulesets,
    register: key => $rulesets = $rulesets.set(key, false) ,
    setEditState: (key, bool = true) => {
      const _rulesets = $rulesets.forEach((edit_state, _key, map) =>
        _key === key ? map.set(_key, bool) : map.set(_key, false));
      dispatch('edit', getIndex(key));
      $rulesets = $rulesets;
    },
    deregister: key => {
      $rulesets.delete(key);
      $rulesets = $rulesets;
    }
  })
</script>

<div class="container">
  <div class="header">
    <h2>Search</h2>
    <button on:click={() => dispatch('reset')}><Sync /></button>
  </div>
  <slot></slot>
  <div class="search">
    <!-- <MultiToggle on:select items={search_indices}/> -->

    <SearchDropdown
      {index}
      indices="{ESIndices}"
      on:indexchange
    />
    <button on:click|stopPropagation>Search</button>
  </div>
</div>

<style lang="less">
  .container {
    button {
      background: var(--button-bg);
      background-image: var(--button-bg-image);
      border: var(--button-border);

      &:hover {
        background-color:var(--button-hover-bg);
        background-image: var(--button-hover-bg-image);
      }
    }

    .header {
      display: flex;
      justify-content: space-between;

      button {
        padding: 0;
        width: 30px;
        height: 30px;
        border: none;
        background: none;
        color: #888;
        cursor: pointer;

        &:inactive {
          opacity: 0.6;
        }

        &:hover {
          color: #333;
        }
      }
    }

    .search {
      display: flex;
      justify-content: center;
      margin-top: 15px;

      button {
        font-size: 16px;
        border-radius: 3px;
        cursor: pointer;
        padding: 3px 10px;
      }
    }
  }

</style>
