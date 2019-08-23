

<script>
  import { setContext, getContext, tick, createEventDispatcher } from 'svelte';
  import { RULESETS } from './SearchContainer.svelte';
  import { RULESET } from './Ruleset.svelte';
  import { Edit } from '../Icons';


  export let isEditing = true;
  export let queries = [
    { query: 'Heart', status: 'and' },
    { query: 'Disease', status: 'not' },
    { query: 'Heart', status: 'and' },
    { query: 'Disease', status: 'not' },
    { query: 'Heart', status: 'and' },
    { query: 'Disease', status: 'not' },
  ];

  // $: queries_string = queries.map(({ query, status }) =>
  //   `${status === 'not' ? '-' : ''}${query}`);

  $: console.log(queries, textQuery)

  const key = getContext(RULESET);
  const { rulesets, setEditState } = getContext(RULESETS);
  const dispatch = createEventDispatcher();

  let editing = false;
  let pillContainer;
  let _pills = [];
  let backspacing = false;
  let input;
  let padbottom = false;


  $: pills = _pills && _pills.filter(v => v !== null);
  $: isEditing = $rulesets.get(key);

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

  const handleKeyup = event => {
    if (event.key === ',') {
      const status = event.target.value.startsWith('-') ? 'not' : 'and';
      const value = event.target.value.replace(',', '');
      dispatch('change', textQuery.concat(event.target.value).join(','));
      event.target.value = '';
    }
  }

  const handleKeydown = event => {
    if (event.key === 'Backspace' && event.target.value.length === 0) {
      if (!queries[queries.length-1]) return;
      event.preventDefault();
      const { term, status } = queries[queries.length-1];
      event.target.value = `${status === 'not' ? '-' : ''}${term}`;
      dispatch('change', textQuery.slice(0, -1).join(','));
    }
  }

  const removeQuery = i => queries = queries.filter((_pills, _i) => i !== _i)

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

</script>

  <div
    class:editing={isEditing}
    class="query-container"
    on:click={() => input && input.focus()}
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
          style="transform: translate({inputCoords.right}px, {inputCoords.top}px)"
          use:fitContent
          on:keyup={handleKeyup}
          on:keydown={handleKeydown}
        />
      {/if}
    </div>
  </div>


<style lang="less">
  .query-container {
    margin-bottom: 10px;

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
      padding: 2px;
      margin: 0;
      list-style: none;
      flex-wrap: wrap;

      &.padbottom {
        margin-bottom: 30px;
      }

      li {
        padding: 2px 10px;
        margin: 3px;
        border-radius: 14px;
        font-size: 14px;

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
</style>
