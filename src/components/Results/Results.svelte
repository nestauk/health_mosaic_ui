<script>
  import { afterUpdate } from 'svelte';

  export let dirty;
  export let changed;

  let container;

  afterUpdate (() => {
    if (changed) {
      container.scrollTop = 0;
    }
  })
</script>

<div bind:this="{container}">
  <ul class:dirty="{dirty}">
    <slot></slot>
  </ul>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    overflow-y: auto;
  }
  ul {
    height: 100%;
    width: 100%;
  }

  ul.dirty {
    /* use to disable events or so */
  }
</style>
