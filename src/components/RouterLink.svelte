<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '@sapper/app';

  const dispatch = createEventDispatcher();

  export let base = "";
  export let href = "";
  export let direct = true;

  $: fullPath = `${base}/${href}`

  const clicked = () => direct ? goto(href) : dispatch('navigate', href);
</script>

<a
  href="{fullPath}"
  on:click|preventDefault={clicked}>
  <slot></slot>
</a>

<style>
  a {
    text-decoration: none;
  }
</style>
