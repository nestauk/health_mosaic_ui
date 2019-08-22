<script context="module">
  export const RULESET = {};
</script>

<script>
  import { getContext, setContext } from 'svelte';
  import { RULESETS } from './SearchContainer.svelte';

  const key = {};
  const { rulesets, register, setEditState } = getContext(RULESETS);

  setContext(RULESET, key);
  register(key);

</script>

<slot></slot>
