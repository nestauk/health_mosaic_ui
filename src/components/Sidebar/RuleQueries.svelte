<script>
  import { tick, createEventDispatcher } from 'svelte';
  import { isIterableEmpty } from '@svizzle/utils';
  import { Edit } from '../Icons';

  export let disabled;
  export let isEditing = true;
  export let queries = [];

  const dispatch = createEventDispatcher();

  let editing = false;
  let pillContainer;
  let _pills = [];
  let backspacing = false;
  let input;
  let padbottom = false;
  let currentInput = '';

  $: pills = _pills && _pills.filter(v => v !== null);

  $: inputCoords = calculateInputLocation(pills[pills.length - 1]);

  $: textQuery = queries.map(({ term, status }) =>
      `${status === 'not' ? '-' : ''}${term}`);

  const calculateInputLocation = (lastPill, inputSize = 20) => {
    if (!lastPill) return { top: 6, right: 0 };

    const el = lastPill.getBoundingClientRect();
    const container = pillContainer.getBoundingClientRect();
    const inputFits = container.width - (el.right - container.left) > inputSize;
    padbottom = !inputFits;

    return {
      top: inputFits ?
        el.top - container.top :
        (el.top - container.top) + el.height + 8,
      right: inputFits ? el.right - container.left : 0
    };
  }

  const addQuery = () => {
    const status = currentInput.startsWith('-') ? 'not' : 'and';
    const value = currentInput.replace(',', '');
    dispatch('change', textQuery.concat(currentInput).join(','));

    currentInput = '';
  }

  export const handleKeyup = event => {
    if (event.key === ',' | event.key === 'Enter') {
      addQuery();
    }
  }

  const handleKeydown = event => {
    if (event.key === 'Backspace' && currentInput.length === 0) {
      if (isIterableEmpty(queries)) return;
      event.preventDefault();
      const { term, status } = queries[queries.length-1];
      currentInput = `${status === 'not' ? '-' : ''}${term}`;
      dispatch('change', textQuery.slice(0, -1).join(','));
    }
  }

  const fitContent = node => {
    const fakeInput = document.createElement('span');
    fakeInput.style.opacity = 0;
    fakeInput.style.position = 'absolute';
    node.parentNode.insertBefore(fakeInput, node.nextSibling);

    function resizeInput(event) {
      const key = event.key === 'Backspace' ? '' : event.key;
      fakeInput.innerText = event.target.value + key;
      const { width } = fakeInput.getBoundingClientRect();
      node.style.width = `${width + 15}px`;
      inputCoords = calculateInputLocation(pills[pills.length - 1], width + 10);
    }

    node.addEventListener('keydown', resizeInput);

    return {
      destroy: () => node.removeEventListener('keydown', resizeInput)
    }
  }

  const autofocus = async node => node.focus();
</script>

<svelte:body on:click={addQuery}/>

<div
  class:disabled
  class:editing={isEditing}
  class="query-container"
  on:click|stopPropagation={() => input && input.focus()}
>
  <div
    class="query-labels"
    bind:this={pillContainer}
  >
    <ul class:padbottom>
      {#each queries.filter(({term}) => term.length) as { term, status }, i}
        <li
          class={status}
          bind:this={_pills[i]}
          on:click|stopPropagation={() => dispatch('toggle', i)}
        >
          {term}
          <span
            class="close"
            on:click|stopPropagation={() => dispatch('change', textQuery.filter((_, _i) => i !== _i ).join(','))}
          >
            x
          </span>
        </li>
      {/each}
    </ul>
    {#if isEditing}
      <input
        bind:this={input}
        bind:value={currentInput}
        style="transform: translate({inputCoords.right}px, {inputCoords.top}px)"
        use:fitContent
        use:autofocus
        on:keyup={handleKeyup}
        on:keydown={handleKeydown}
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
      &.padbottom {
        margin-bottom: 30px;
      }

      li {
        padding: 2px 10px;
        margin: 3px;
        border-radius: 14px;
        font-size: 14px;
        user-select: none;
        cursor: pointer;

        .close {
          margin-left: 5px;
          cursor: pointer;
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