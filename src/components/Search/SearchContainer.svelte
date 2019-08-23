<script context="module">
  export const RULESETS = {};
</script>

<script>
  import { setContext, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import { Sync } from '../Icons';
  import MultiToggle from '../MultiToggle.svelte';

  const rulesets = writable(new Map());
  const dispatch = createEventDispatcher();
  const search_indices= ['Research', 'Companies', 'Events'];

  setContext(RULESETS, {
    rulesets,
    register: key => $rulesets = $rulesets.set(key, false) ,
    setEditState: (key, bool = true) => {
      const _rulesets = $rulesets.forEach((edit_state, _key, map) =>
        _key === key ? map.set(_key, bool) : map.set(_key, false));

      $rulesets = $rulesets;
    }
  })
</script>

<div class="container">
  <div class="header">
    <h2>Search</h2>
    <button><Sync /></button>
  </div>
  <slot></slot>
  <div class="search">
    <MultiToggle on:select items={search_indices}/>
    <button on:click>Search</button>
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
        border-radius: 50%;
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
      button {
        font-size: 16px;
        border-radius: 3px;
        cursor: pointer;
        padding: 3px 10px;
        margin-top: 10px;
      }
    }
  }
</style>
