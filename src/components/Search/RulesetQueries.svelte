<script>
  import { getContext, tick } from 'svelte';
  import { RULESETS } from './SearchContainer.svelte';
  import { Edit } from '../Icons';

  export let isEditing = true;
  export let queries = [
    { query: 'Heart', status: 'include' },
    { query: 'Disease', status: 'exclude' },
    { query: 'Heart', status: 'include' },
    { query: 'Disease', status: 'exclude' },
    { query: 'Heart', status: 'include' },
    { query: 'Disease', status: 'exclude' },
  ];

  const { rulesets, register, setEditState } = getContext(RULESETS);

  const key = {};

  let editing = false;
  let pillContainer;
  let _pills = [];
  let backspacing = false;
  let input;
  let padbottom = false;

  register(key);

  $: pills = _pills && _pills.filter(v => v !== null);
  $: isEditing = $rulesets.get(key);

  $: inputCoords = calculateInputLocation(pills[pills.length - 1]);

  $: textQuery = queries.map(({ query, status }) =>
      (status === 'exclude' ? '-' : '') + query, "").join(', ');

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
      const status = event.target.value.startsWith('-') ? 'exclude' : 'include';
      const value = event.target.value.replace(',', '');
      queries.push({
        status: status,
        query: value.replace(/^-/, '')
      })
      event.target.value = '';
      queries = queries;
    }
  }

  const handleKeydown = event => {
    if (event.key === 'Backspace' && event.target.value.length === 0) {
      if (!queries[queries.length-1]) return;
      event.preventDefault();
      const { query, status } = queries[queries.length-1];
      event.target.value = `${status === 'exclude' ? '-' : ''}${query}`;
      queries.pop();
      queries = queries;
    }
  }

  const handleEdit = async () => {
    setEditState(key);
    await tick();
    input.focus();
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
      console.log(inputCoords);
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
  >
    <div
      class="query-labels"
      bind:this={pillContainer}
    >
      <ul class:padbottom>
        {#each queries as { query, status }, i}
          <li
            class={status}
            bind:this={_pills[i]}
          >
            {query}
            <span
              class="close"
              on:click={() => removeQuery(i)}
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
    <button on:click={handleEdit}><Edit /></button>
  </div>


<style lang="less">
  .query-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;

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
        border-radius: 3px;
        box-shadow: inset 0 1px 2px rgba(27,31,35,.075);
        background: #fff;
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
        padding: 1px 6px;
        border: 1px solid #ccc;
        margin: 3px;
        border-radius: 5px ~"/" 10px;
        font-size: 14px;

        .close {
          margin-left: 5px;
          cursor: pointer;
        }

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
