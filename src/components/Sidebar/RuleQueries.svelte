<script>
  import { tick, createEventDispatcher } from 'svelte';
  import * as _ from 'lamb';
  import { isIterableEmpty } from '@svizzle/utils';
  import { XIcon } from 'svelte-feather-icons';
  import { Edit } from '../Icons';

  export let disabled;
  export let isEditing = true;
  export let queries = [];

  const dispatch = createEventDispatcher();

  let backspacing = false;
  let input;

  $: currentInput = textQuery.join(', ');

  $: textQuery = queries.map(({ term, status }) =>
      `${status === 'not' ? '-' : ''}${term}`);

  function textAreaResize(e) {
    e.style.height = "1px";
    e.style.height = (+e.scrollHeight)+"px";
  }

  export const handleKeydown =  event => {
    const content = event.target.value.split(",").map(s => s.trim()).join(',');
    dispatch('change', content);

    if (event.key === 'Enter') {
       event.preventDefault();
       dispatch('commit');
    }
  }

  const handleKeyup = event => {
    textAreaResize(event.target)
  }

  const autofocus = async node => node.focus();
</script>

<svelte:body />

<div
  class:disabled
  class:editing={isEditing}
  class="query-container"
  on:click|stopPropagation={() => input && input.focus()}
>
  <div
    class="query-labels"
  >
    {#if !isEditing}
    <ul>
      {#each queries.filter(({term}) => term.length) as { term, status }, i}
        <li
          class={status}
          on:click|stopPropagation={() => dispatch('toggle', i)}
        >
          {term}
          <span
            class="close"
            on:click|stopPropagation={() => dispatch('change', textQuery.filter((_, _i) => i !== _i ).join(','))}
          >
              <XIcon />
          </span>
        </li>
      {/each}
    </ul>
    {:else}
      <textarea
        bind:this={input}
        value={currentInput}
        use:autofocus
        use:textAreaResize
        on:keydown={handleKeydown}
        on:keyup={handleKeyup}
        autocomplete="false"
      />
    {/if}
  </div>
</div>

<style lang="less">
  .query-container {
    margin-bottom: 10px;
    transition: 0.2s;
    .query-labels {
      border: 1px solid transparent;
      position: relative;
      width: 100%;
      margin-right: 20px;
      min-height: 37px;

      textarea {
        border: none;
        margin: 7px 10px 0px 10px;
        background: none;
        width: calc(100% - 20px);
        font-size: 14px;
        outline: none;
        overflow: hidden;
        resize: none;
      }
    }

    &.editing {
      .query-labels {
        border: 1px solid #d1d5da;
        border-radius: 17px;
        box-shadow: inset 0 1px 2px rgba(27,31,35,.075);
        background: #fff;
      }

      .expand {
        span::after {
          background: #8cc1c1;
        }
      }
    }

    ul {
      display: flex;
      padding: 2px;
      margin: 0;
      list-style: none;
      flex-wrap: wrap;
      user-select: none;

      li {
        padding: 2px 10px;
        margin: 3px;
        border-radius: 14px;
        font-size: 14px;
        user-select: none;
        cursor: pointer;
        display: flex;

        .close {
          margin-left: 5px;
          cursor: pointer;
          font-weight: 700;
          margin-left: 10px;
          color: #fff;
          width: 1.2em;
          height: 1.2em;
          transform: translate(0px, 3px);
          opacity: 0.7;
          display: inline-block;
          &:hover {
            opacity: 1;
          }
        }

        &.and {
          color: #fff;
          font-weight: 500;
          background-color: #8cc1c1;
        }

        &.not {
          background-color: #f77c66;
          color: #fff;
          font-weight: 500;
        }
      }
    }
  }

  .edit {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  input {
    position: absolute;
    top: 0;
    left: 0;
    outline: none;
    width: 130px;
    background: none;
    margin: 1px 8px 0px 11px;
    border: 1px solid transparent;
    border-radius: 3px;
    font-size: 14px;
  }

  .disabled {
    opacity: 0.6;
  }
</style>
