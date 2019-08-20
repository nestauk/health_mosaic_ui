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
    <button><Sync /></button>
  </div>



  <slot></slot>

  <div class="search">
    <MultiToggle on:select items={search_indices}/>
    <button on:click>Search</button>
  </div>
</div>

<style lang="less">
  .container {
    button {
      background: var(--button-bg);
      background-image: var(--button-bg-image);
      border: var(--button-border);

      &:hover {
        background-color:var(--button-hover-bg);
        background-image: var(--button-hover-bg-image);
      }
    }

    .header {
      display: flex;
      justify-content: space-between;

      button {
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        color: #888;
        cursor: pointer;

        &:inactive {
          opacity: 0.6;
        }

        &:hover {
          color: #333;
        }
      }
    }

    .search {
      button {
        font-size: 16px;
        border-radius: 3px;
        cursor: pointer;
        padding: 3px 10px;
        margin-top: 10px;
      }
    }
  }
</style>
