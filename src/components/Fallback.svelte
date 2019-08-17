<script>
  import { onMount } from 'svelte';

  export let message;
  let visible = false;

  onMount(() => {
    visible = true;
  });
</script>

<div class="fallback">
  <div class="message" class:visible>
    <slot>
      <span>{message}</span>
    </slot>
  </div>
</div>

<style lang="less">
  .fallback {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    .message {
      background-color: orange;
      color: white;
      font-weight: bold;
      padding: 0.5em 1em;
      border-radius: 3em;
      pointer-events: auto; /* in case the content in the slot has links */

      opacity: 0;
      transition-property: opacity;
      transition-duration: 1s;

      &.visible {
        opacity: 1;
      }
    }
  }
</style>
