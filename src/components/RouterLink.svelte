<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '@sapper/app';
  import { makeStyle } from '@svizzle/dom';

  const dispatch = createEventDispatcher();

  export let base = "";
  export let href = "";
  export let direct = true;
  export let style;

  $: fullPath = `${base}/${href}`

  const clicked = () => direct ? goto(href) : dispatch('navigate', href);
</script>

<a
  href="{fullPath}"
  on:click|preventDefault={clicked}
  {style}
>
  <slot></slot>
</a>

<style>
  a {
    text-decoration: none;
  }
</style>
