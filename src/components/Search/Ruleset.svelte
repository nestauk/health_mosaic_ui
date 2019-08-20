<script context="module">
  export const RULESET = {};
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import { EditIcon, CopyIcon, PlusCircleIcon, ToggleLeftIcon, Trash2Icon } from 'svelte-feather-icons';

  export let hasContent;
  export let disabled;
  export let isEditing;
  export let isOnly;
  export let mode;
  const dispatch = createEventDispatcher();

</script>

<div>
  <slot></slot>
  {#if mode === 'complex'}
    <ul >
      {#if hasContent}
        <li
          title="Copy ruleset"
          on:click={() => dispatch('copy')}
        >
          <CopyIcon size={1.5} />
        </li>
        <li
          title="Delete ruleset"
          class:inactive={isOnly}
          on:click={() => dispatch('delete')}
        >
          <Trash2Icon size={1.5} />
        </li>
        <li
          title="Disable ruleset"
          class:disabled
          on:click={() => dispatch('disable')}
        >
          <ToggleLeftIcon size={1.5} />
        </li>
      {/if}

      <li
        title="Edit ruleset"
        class:isEditing
        on:click={() => dispatch('edit')}
      >
        <EditIcon size={1.5} />
      </li>
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
      color: #777;
      cursor: pointer;

      &.isEditing {
        opacity: 0.5;
        color: #777!important;

      }

      &:hover {
        color: #333;
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
