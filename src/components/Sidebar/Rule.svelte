<script context="module">
  export const RULESET = {};
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import {
    CopyIcon,
    EditIcon,
    EyeIcon,
    EyeOffIcon,
    PlusCircleIcon,
    Trash2Icon
  } from 'svelte-feather-icons';

  export let disabled;
  export let hasContent;
  export let isEditing;
  export let isOnly;
  export let mode;

  const dispatch = createEventDispatcher();
</script>

<div>
  <slot></slot>
  {#if mode === 'complex'}
    <ul>
      {#if hasContent}
        <li on:click={() => dispatch('copy')}>
          <CopyIcon size={1.5} />
        </li>
        <li
          class:inactive={isOnly}
          on:click={() => dispatch('delete')}
        >
          <Trash2Icon size={1.5} />
        </li>
        <li on:click={() => dispatch('disable')}>
          {#if disabled}
            <EyeIcon />
          {:else}
            <EyeOffIcon />
          {/if}

        </li>
        <li
          class:isEditing
          on:click={() => dispatch('edit')}
        >
          <EditIcon size={1.5} />
        </li>
      {/if}


    </ul>
  {:else}
    <ul>
      {#if hasContent}
        <li
          class:isEditing
          on:click={() => dispatch('edit')}
        >
          <EditIcon size={1.5} />
        </li>
      {/if}
    </ul>
  {/if}
</div>

<style lang="less">
  div {
    margin-bottom: 15px;
    border-bottom: 1px solid #ccc;
  }
  ul {
    display: flex;
    justify-content: center;
    padding: 0;
    margin: 0 0 15px 0;
    list-style: none;

    li {
      padding: 0;
      margin: 0 10px;
      width: 1.5em;
      height: 1.5em;
      color: var(--color-ruleset-icon);
      cursor: pointer;

      &.isEditing {
        opacity: 0.5;
        color: var(--color-ruleset-icon)!important;
      }

      &:hover {
        color: var(--color-ruleset-icon-hover);
      }
    }
  }

  li :global(svg circle) {
    transition: 0.2s;
  }
  .disabled :global(svg circle) {
    transform: translateX(8px);
  }
  .inactive {
    opacity: 0.6;
  }
</style>
