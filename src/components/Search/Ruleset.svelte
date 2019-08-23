<script context="module">
  export const RULESET = {};
</script>

<script>
  import { createEventDispatcher, getContext, setContext } from 'svelte';
  import { EditIcon, CopyIcon, PlusCircleIcon, SaveIcon, ToggleLeftIcon, Trash2Icon } from 'svelte-feather-icons';

  import { RULESETS } from './SearchContainer.svelte';

  const key = {};
  const { rulesets, register, setEditState } = getContext(RULESETS);
  const dispatch = createEventDispatcher();

  $: lastRuleset = Array.from($rulesets)[$rulesets.size - 1][0] === key;
  $: isEditing = $rulesets.get(key);

  setContext(RULESET, key);
  register(key);

</script>

<div>
  <slot></slot>
  <ul>
    <li on:click={() => dispatch('copy')}><CopyIcon size={1.5} /></li>
    <li on:click={() => dispatch('delete')}><Trash2Icon size={1.5} /></li>
    <li on:click={() => dispatch('disable')}><ToggleLeftIcon size={1.5} /></li>

    {#if !isEditing}
      <li on:click={() => setEditState(key, true)}><EditIcon size={1.5} /></li>
    {:else}
      <li on:click={() => setEditState(key, false)}><SaveIcon /></li>
    {/if}

    {#if lastRuleset}
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
