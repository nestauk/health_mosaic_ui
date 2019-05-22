<script>
  let tooltip;
</script>

<form on:submit|preventDefault>
  <div class="button">
    <button
      on:mouseenter={() => (tooltip = true)}
      on:mouseleave={() => (tooltip = false)}
      type="button"
      on:click>
      +
    </button>

    {#if tooltip}
      <span>Add new query (return)</span>
    {/if}
  </div>
  <slot />

  <button class="search-button" on:click>Search</button>

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
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
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
    width: 9.3rem;
    top: -1rem;
    color: #eee;
    padding: 4px 8px;
    border-radius: 2px;
    z-index: 99;
  }
</style>
