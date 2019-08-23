<script context="module">
  export const RULESET = {};
</script>

<script>
  import { createEventDispatcher, getContext, setContext, onDestroy } from 'svelte';
  import { EditIcon, CopyIcon, PlusCircleIcon, SaveIcon, ToggleLeftIcon, Trash2Icon } from 'svelte-feather-icons';

  import { RULESETS } from './SearchContainer.svelte';

  export let hasContent;

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

<div>
  <slot></slot>
  <ul>
    {#if hasContent}
    <li on:click={() => dispatch('copy')}><CopyIcon size={1.5} /></li>
    <li on:click={() => dispatch('delete')}><Trash2Icon size={1.5} /></li>
    <li on:click={() => dispatch('disable')}><ToggleLeftIcon size={1.5} /></li>
    {/if}

    {#if !isEditing}
      <li on:click={() => setEditState(key, true)}><EditIcon size={1.5} /></li>
    {:else}
      <li on:click={() => setEditState(key, false)}><SaveIcon /></li>
    {/if}

    {#if lastRuleset && hasContent}
      <li on:click={() => dispatch('newrule')}><PlusCircleIcon size={1.5} /></li>
    {/if}
</ul>
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

      &:hover {
        color: #333;
      }
    }
  }
</style>
