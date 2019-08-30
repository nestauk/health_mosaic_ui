<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '@sapper/app';

  const dispatch = createEventDispatcher();

  export let base = "";
  export let href = "";
  export let style;

  $: fullPath = `${base}/${href}`
</script>

<a
  href="{fullPath}"
  on:click|preventDefault={() => dispatch('navigate', href)}
  {style}
>
  <slot></slot>
</a>

<style>
  a {
    text-decoration: none;
  }
</style>
