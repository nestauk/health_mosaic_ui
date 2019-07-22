<script>
  import { createEventDispatcher } from 'svelte';
  import { queryToString } from '../../util/transform.ts';
  const dispatch = createEventDispatcher()

  function handleEnter(event, isWindow = false) {
    if (event.key !== 'Enter') return;
    dispatch('enter');
  }

  export function focus(){
    input.focus();
  }

  export let current;
  let inputValue = '';
  let input;

  $: inputValue = queryToString(current);
</script>

<div class="input-wrap">
  <label class="input" for="search-builder">Search:</label>
  <input
    autocomplete="off"
    id="search-builder"
    value="{inputValue}"
    bind:this="{input}"

    on:keydown="{handleEnter}"
    on:input="{({ target }) => dispatch('change', target.value)}"
    placeholder="example: cancer, -breast"
  />
  {#if inputValue.length !== 0}
  <span class="label tip">Press return or + to add a new query</span>
  {/if}
</div>

<style>
input {
    margin: 0;
    margin-top: -20px;
    padding: 20px 15px;
    border: none;
    border-bottom: 1px solid #ccc;
    border-radius: 0;
    font-size: 25px;
    background: transparent;
    outline: none;
    transition: 0.2s;
    width: 100%;
    height: 100%;
  }

  input::placeholder {
    font-size: 16px;
  }

  input:focus {
    border-bottom: 1px solid #333;
  }

  .input-wrap {
    width: 40%;
    height: 2rem;
  }
  .label {
    margin-left: 15px;

    display: block;
    font-size: 0.8rem;
    margin-top: -10px;
  }

  .label.tip {
    margin-left: 15px;
    padding-top: 1px;
    display: block;
    font-size: 0.8rem;
    margin-top: 5px;
  }

  .input {
    font-size: 0;
    opacity: 0;
  }
</style>
