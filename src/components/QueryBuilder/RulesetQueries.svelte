<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let terms;
</script>

<ul class="query-container">
  {#each terms as {term, status}, j}
      <li class="query {status}" on:click="{() => dispatch('toggle', j)}">
        {term}
      </li>
  {/each}
</ul>


<style>
  .query-container {
    display: flex;
    margin: 10px 15px 0 0;
    padding: 5px;
    border: none;
    border: 1px solid #ccc;
    border-radius: 1rem;
    font-size: 18px;
    height: 2rem;
    color: #333;
  }

  .query {
    margin: 0 5px;
    color: #333;
    display: flex;
    color: limegreen;
    line-height: 1;
  }

  .query.not {
    color: red;
  }

  .query.and {
    border-color: limegreen;
  }
</style>
