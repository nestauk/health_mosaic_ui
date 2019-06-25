<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let base = "";
  export let href = "";

  $: fullPath = `${base}/${href}`
</script>

<a
  href="{fullPath}"
  on:click|preventDefault={() => dispatch('navigate', href)}>
  <slot></slot>
</a>

<style>
  a {
    text-decoration: none;
  }
</style>