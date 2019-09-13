<script>
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';

  import { PlusCircleIcon } from 'svelte-feather-icons';
  import { Sync } from '../Icons';
  import Switch from '../Switch.svelte';

  import { ESIndices } from '../../config';
  import Dropdown from '../Dropdown.svelte';

  const dispatch = createEventDispatcher();

  export let index;
  export let logic;
  export let mode;
  export let rulesets;
</script>

<div class="container">
  <div class="header">
    <h2>Search</h2>
    <ul>
      <li
        class:active={mode === 'simple'}
        on:click={() => mode === 'complex' && dispatch('modechange', 'SIMPLE')}
      >
        Simple
      </li>
      <li
        class:active={mode === 'complex'}
        on:click={() => mode === 'simple' && dispatch('modechange', 'COMPLEX')}
      >
        Advanced
      </li>
    </ul>
  </div>

  <slot></slot>

  <div class="search">
    {#if mode === 'complex'}
      <div class="logic">
        <Switch
          on:toggle
          values={["AND", "OR"]}
          current={logic}
        />
        <span on:click={() => dispatch('newrule')}><PlusCircleIcon size={1.5} /></span>
      </div>
    {/if}
    <div>
      <Dropdown
        {index}
        options="{ESIndices}"
        on:change
      />
      <button class="search-button" on:click|stopPropagation>Search</button>
      <button class="reset-button" on:click={() => dispatch('reset')}><Sync /></button>
    </div>
  </div>
</div>

<style lang="less">
  .container {
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.3rem;
      }

      ul {
        margin: 0;
        margin-left: auto;
        display: flex;
        list-style: none;
        font-size: 0.9rem;

        li {
          margin: 0 0 0 10px;
          color: #777;
          cursor: pointer;
          user-select: none;

          &:first-child:after {
            content: '|';
            margin-left: 10px;
            color: #333;
          }
          &.active {
            opacity: 1;
            color: #333;
          }
        }
      }
    }

    button {
      background: var(--color-button-background);
      background-image: var(--gradient-button-background);
      border: var(--border-button);

      &:hover {
        background-color:var(--color-button-background-hover);
        background-image: var(--gradient-button-background-hover);
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
