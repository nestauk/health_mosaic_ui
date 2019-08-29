<script>
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';

  import { PlusCircleIcon } from 'svelte-feather-icons';
  import { Sync } from '../Icons';
  import Switch from '../Switch.svelte';

  import { ESIndices } from '../../config';
  import MultiToggle from '../MultiToggle.svelte';
  import { SearchDropdown } from './index.js';

  export let index;
  export let logic;
  export let ruesets;

  const dispatch = createEventDispatcher();
  const search_indices= ['Research', 'Companies', 'Events'];

</script>

<div class="container">
  <div class="header">
    <h2>Search</h2>
  </div>

  <slot></slot>

  <div class="search">
    <div class="logic">
      <Switch
        on:toggle
        values={["AND", "OR"]}
        current={logic}
      />
      <span on:click={() => dispatch('newrule')}><PlusCircleIcon size={1.5} /></span>
    </div>

    <div>
      <SearchDropdown
        {index}
        indices="{ESIndices}"
        on:indexchange
      />

      <button class="search-button" on:click|stopPropagation>Search</button>
      <button class="reset-button" on:click={() => dispatch('reset')}><Sync /></button>
    </div>
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

    .search {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: 15px;

      .logic {
        border-bottom: 1px solid #ccc;
        box-sizing: border-box;
        padding-bottom: 2em;
        height: 3.6em;
      }

      div {
        display: flex;
        justify-content: center;
        margin-top: 15px;
        height: 2em;
        cursor: pointer;

        span {
          height: 100%;
          width: 2em;
        }

        .search-button {
          font-size: 16px;
          border-radius: 3px;
          cursor: pointer;
          padding: 3px 10px;
          user-select: none;
        }

        .reset-button {
          padding: 0;
          width: 30px;
          height: 30px;
          border: none;
          background: none;
          color: #888;
          cursor: pointer;
          margin-left: 20px;

          &:inactive {
            opacity: 0.6;
          }

          &:hover {
            color: #333;
          }
        }
      }
    }
  }

</style>
