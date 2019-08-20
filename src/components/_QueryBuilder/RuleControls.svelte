<script>
  import {Copy, Trash, Toggle} from '../Icons';
  import { createEventDispatcher } from 'svelte';

  export let disabled;
  const dispatch = createEventDispatcher();
</script>

<div class="rule-controls">
  <span on:click|stopPropagation="{() => dispatch('copy')}">
    <Copy />
  </span>
  <span on:click|stopPropagation="{() => dispatch('delete')}">
    <Trash/>
  </span>
  <span on:click|stopPropagation="{() => dispatch('disable')}">
    <Toggle {disabled}/>
  </span>
</div>

<style>
  div {
    display: flex;
    height: 100%;
  }
  span {
    width: 1.3rem;
    margin: 0 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
  }
  
</style>
