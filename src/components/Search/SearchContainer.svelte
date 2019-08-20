<script>
  import { createEventDispatcher } from 'svelte';
  import { Sync } from '../Icons';
  import MultiToggle from '../MultiToggle.svelte';

  const dispatch = createEventDispatcher();
  const search_indices= ['Research', 'Companies', 'Events'];
</script>

<div class="container">
  <div class="header">
    <h2>Search</h2>
    <span><Sync /></span>
  </div>

  <slot></slot>

  <div>
    <MultiToggle on:select items={search_indices}/>
    <button on:click>Search</button>
  </div>
</div>

<style lang="less">
  .container {

    .header {
      display: flex;
      span {
        width: 30px;
        color: #ccc;
      }
    }
  }
</style>
