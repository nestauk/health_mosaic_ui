<script context="module">
  export const RULESET = {};
</script>

<script>
  import { createEventDispatcher, getContext, setContext, onDestroy } from 'svelte';
  import { EditIcon, CopyIcon, PlusCircleIcon, SaveIcon, ToggleLeftIcon, Trash2Icon } from 'svelte-feather-icons';
  import { RULESETS } from './SearchContainer.svelte';

  export let hasContent;
  export let disabled;

  const key = {};
  const { deregister, rulesets, register, setEditState } = getContext(RULESETS);
  const dispatch = createEventDispatcher();

  $: lastRuleset = Array.from($rulesets)[$rulesets.size - 1][0] === key;
  $: isEditing = $rulesets.get(key);

  setContext(RULESET, key);
  register(key);
  setEditState(key, true);

  onDestroy(() => deregister(key))

</script>

{#if isEditing | hasContent}
<div>
  <slot></slot>
  <ul>
    {#if hasContent}
      <li on:click={() => dispatch('copy')}><CopyIcon size={1.5} /></li>
      <li on:click={() => dispatch('delete')}><Trash2Icon size={1.5} /></li>
      <li class:disabled on:click={() => dispatch('disable')}><ToggleLeftIcon size={1.5} /></li>
    {/if}

    <li class:isEditing on:click={() => setEditState(key, !isEditing)}><EditIcon size={1.5} /></li>
  </ul>
</div>
{/if}

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
</style>
