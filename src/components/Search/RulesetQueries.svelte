<script>
  import { Edit } from '../Icons';
  export let isEditing = true;
  export let queries = [{ query: 'Heart', status: 'include' }, { query: 'Disease', status: 'exclude' }];

  $: textQuery = queries.map(({ query, status }) => (status === 'exclude' ? '-' : '') + query, "").join(', ');
</script>

{#if !isEditing}
  <div class="no-edit">
    <div class="query-labels">
      <ul>
        {#each queries as { query, status }}
          <li class={status}>{query}</li>
        {/each}
      </ul>
    </div>
    <button on:click={() => isEditing = true}><Edit /></button>
  </div>
{:else}
  <div class="edit">
    <input value={textQuery}/>
    <button on:click={() => isEditing = false}>x</button>
  </div>
{/if}

<style lang="less">
  .no-edit {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;

    button {
      padding: 0;
      width: 30px;
      height: 30px;
      border: none;
      cursor: pointer;
      color: #999;

      &:inactive {
        opacity: 0.6;
      }

      &:hover {
        color: #333;
      }
    }

    ul {
      display: flex;
      padding: 3px 5px;
      margin: 0;
      list-style: none;

      li {
        padding: 3px 9px;
        border: 1px solid #ccc;
        margin: 5px 5px 0 0;
        border-radius: 3px;

        &.include {
          color: green;
          border-color: green;
        }

        &.exclude {
          color: red;
          border-color: red;
        }
      }
    }
  }

  .edit {
    display: flex;
    justify-content: space-between;

    button {
      padding: 0;
      width: 30px;
      height: 30px;
      border: none;
      cursor: pointer;
      color: #999;
      transform: translateY(5px);

      &:inactive {
        opacity: 0.6;
      }

      &:hover {
        color: #333;
      }
    }
  }

  input {
    outline: none;
    border: none;
    border-bottom: var(--button-border);
    font-size: 16px;
    width: 100%;
    background: none;
    padding: 5px;
    margin: 0 20px 15px 0;
    padding: 14px 9px 8px;

    &:focus {
      border-color: #333;
    }
  }
</style>
