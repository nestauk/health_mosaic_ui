<script>
  import { fade } from 'svelte/transition';
  export let text = '';
  export let offset = 0;
  export let width = "200px";
  export let maxWidth = "10vw";
  export let prefix = "Powered by";
  export let arrow = true;
  export let transition = false;

  $: ([x, y] = offset);
</script>

<span
  class:arrow
  style="transform: translate({x},{y}); width:{width};  max-width:{maxWidth};"
  transition:fade="{{duration: transition ? 200 : 0}}"
>
  {prefix} {text}
</span>

<style>
  span {
    position: absolute;
    padding: 2px 5px;
    background: #333;
    border-radius: 2px;
    color: #eee;
    width: 200px;
    font-size: 14px;
    text-align: center;
    right: 0;
    top: 42px;
    max-width: 10vw;
    z-index: var(--z-index-menu);
  }

  .arrow::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 5px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #333;
  }
</style>
