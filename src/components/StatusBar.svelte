<script>
  import { fade } from 'svelte/transition';

  export let text = '';
  export let show = false;
</script>

<span class="outer">
  {#if text && show}
    <span
      class="inner"
      transition:fade
    >
      {text}
    </span>
  {/if}
</span>

<style>
  .outer {
    height: 2rem;
    text-align: center;
    margin: 10px 0 5px 0;
  }
  .inner {
    display: inline-block;
    padding: 2px 5px;
    background: #333;
    border-radius: 2px;
    color: #eee;
    font-size: 14px;
    text-align: center;
  }
</style>
