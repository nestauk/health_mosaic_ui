<script>
  import { createEventDispatcher } from 'svelte';

  export let formHeight = 0, isQueries;
  const dispatch = createEventDispatcher();
  let tooltip;
</script>

<form on:submit|preventDefault style="position: static;">
<span bind:offsetHeight="{formHeight}">
  <div class="button">
    <button
      on:mouseenter={() => (tooltip = true)}
      on:mouseleave={() => (tooltip = false)}
      type="button"
      on:click="{() => dispatch('newrule')}"
    >
      +
    </button>

    {#if tooltip}
      <span>Add new query</span>
    {/if}
  </div>
</span>
  <slot />
  {#if isQueries}
    <button class="search-button" on:click="{() => dispatch('search')}">Search</button>
  {/if}
</form>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    padding: 0;
  }

  form {
    padding: 10px 0 0 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    position: static;
    margin-bottom: 30px;
  }

  button {
    height: 2.2rem;
    margin-top: 15px;
    background: #eee;
    border: 1px solid #aaa;
    padding: 10px 15px;
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    float: right;
  }

 .button {
    margin-right: 15px;
    font-size: 20px;
    position: relative;
  }

  .button button {
    font-size: 1.4rem;
    padding: 0 15px;
  }

  .button span {
    position: absolute;
    font-size: 12px;
    font-weight: 300;
    width: 6.5rem;
    top: -1rem;
    color: #eee;
    padding: 4px 8px;
    border-radius: 2px;
    z-index: 99;
    background: #333;
  }

  .search-button {
	position: absolute;
	cursor: pointer;
	right: 80px;
  bottom: 20px;
	transition: 0.2s;
}
</style>
