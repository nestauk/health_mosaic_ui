<script>
  import { createEventDispatcher } from 'svelte';

  import { Selector, Dots } from '../Icons'
  export let selected, options;

  const dispatch = createEventDispatcher();
</script>

<div
  class="container"
  class:selected="{selected}"
  on:mouseleave|stopPropagation="{() => dispatch('close')}"
>
  <div class="master">
    <Selector {selected}/>
    <Dots on:open/>
  </div>
  {#if options}
  <div class="context" on:mouseleave|stopPropagation="{() => dispatch('close')}">
    <slot></slot>
  </div>
  {/if}
</div>

<style>
  div {
    display: flex;
    position: relative;
    justify-content: flex-end;
    align-items: center;
  }

  .context {
    height: 31px;
    position: absolute;
    border: 1px solid #aaa;

    background: #eee;
    border-radius: 2rem;
    right: -5px;
  }

  .container {
    align-items: center;
  }
  
  .master {
    width: 5rem;
    height: 100%;
  }
</style>
