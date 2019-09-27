<script>
  import { fade } from 'svelte/transition';

  export let text = '';
  export let duration = 3000;

  let show = false;
  let timer = false;

  const showText = () => {
    show = true;
    if (timer) {
      clearTimeout(timer);
      timer = false;
    }
    timer = setTimeout(() => {
      text = '';
      show = false;
      timer = false;
    }, duration)
  }

  $: text && showText();
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
    margin-top: 5px;
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
