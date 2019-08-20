<script>
  import { createEventDispatcher } from 'svelte';

  import Switch from '../Switch.svelte';
  import FormDropdown from './FormDropdown.svelte';
  import { Sync } from '../Icons/';
  import { ESIndices } from '../../config';

  const dispatch = createEventDispatcher();

  export let logic;
  export let index;
  export let isEmptyQuery;
  export let hasPreviousQuery;
  export let isDirty;
  export let open;
</script>

<div class="form-controls">
  <Switch
    on:toggle
    values={["AND", "OR"]}
    current={logic}
  />

  <FormDropdown
    {index}
    indices="{ESIndices}"
    on:indexchange
  />
  {#if isEmptyQuery}
    <button class="search-button" on:click="{() => dispatch('send')}">Search</button>
  {/if}
  {#if hasPreviousQuery}
    <span
        class="reset-button"
        class:active="{isDirty}"
        on:click="{() => dispatch('reset')}"
      >
        <Sync  />
    </span>
  {/if}
  {#if isEmptyQuery}

    <div
      class="close-label"
      on:click="{() => dispatch('toggledrawer')}"
      style="{open ? 'transform: rotate(180deg) ' : ''}"
    >
      <img alt="close search" src="arrow.svg"/>
    </div>
  {/if}
</div>

<style lang='less'>
  .form-controls {
    display: flex;
    position: absolute;
    bottom: 0;
    right: 15px;
    justify-content: flex-end;
    align-items: center;
    z-index: 2;

    .search-button, .reset-button {
      cursor: pointer;
      transition: 0.2s;
    }

    .search-button {
      margin-right:15px;
      padding: 10px 15px;
      height: 100%;
      border-radius: 2px;
    }

    .reset-button {
      margin-right:15px;
      width: 30px;
      transform: translateY(3px);
      opacity: 0.5;
    }

    .active {
      opacity: 1;
    }
  }

  .close-label {
    padding: 5px 0;
    cursor: pointer;
    width: 40px;
    height: 40px;
    transition: 0.2s;

    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
