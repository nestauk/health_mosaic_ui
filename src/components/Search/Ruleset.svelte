<script context="module">
  export const RULESET = {};
</script>

<script>
  import { getContext, setContext } from 'svelte';
  import {Trash2Icon, CopyIcon, PlusCircleIcon, ToggleLeftIcon} from 'svelte-feather-icons';

  import { RULESETS } from './SearchContainer.svelte';

  const key = {};
  const { rulesets, register, setEditState } = getContext(RULESETS);

  $: lastRuleset = Array.from($rulesets)[$rulesets.size - 1][0] === key;

  setContext(RULESET, key);
  register(key);

</script>

<slot></slot>

<ul>
  <li><CopyIcon size={1.5} /></li>
  <li><Trash2Icon size={1.5} /></li>
  <li><ToggleLeftIcon size={1.5} /></li>
  {#if lastRuleset}
    <li><PlusCircleIcon size={1.5} /></li>
  {/if}
</ul>


<style lang="less">
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
    }
  }
</style>
