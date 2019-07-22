<script>
  import { createEventDispatcher } from 'svelte';

  export let title;
  export let description;
  export let editing;

  let active = true;
  const dispatch = createEventDispatcher();

  function autofocus(node, { active }) {
    if (!active) return;
    node.focus();

    return {
      update({ editing }) {
        if (!editing) return;
        node.focus();
      },
    };
  }

  $: dispatch('change', { title, description });
</script>

<div class="editor" class:pinned="{!editing}">
  <input
    use:autofocus="{{active, editing}}"
    bind:value="{title}"
    readonly="{!editing}"
    type="text"
    placeholder="title"
  />
  <textarea
    bind:value="{description}"
    readonly="{!editing}"
    placeholder="Type your stuff here"
  ></textarea>
</div>

<style>
  .editor {
    position: absolute;
    width: 33%;
    top: 40px;
    right: 40px;
    bottom: 100px;
    background: rgba(0, 0, 0, 0.9);
    padding: 30px;
    border-radius: 2px;
    z-index: 2;
    transition: 0.2s;
  }

  input {
    width: 100%;
    height: 30px;
    border: none;
    border-bottom: 1px solid #888;
    transition: 0.2s;
    font-size: 30px;
    background: transparent;
    color: #eee;
    padding-bottom: 5px;
    outline: none;
  }

  input:focus {
    border-bottom: 1px solid #eee;
  }

  textarea {
    margin-top: 30px;
    width: 100%;
    height: calc(100% - 90px);
    background: transparent;
    border: none;
    color: #eee;
    font-family: Inter, sans-serif;
    font-weight: 200;
    outline: none;
    transition: 0.2s;
  }

  .pinned {
    background: rgba(0, 0, 0, 0.75);
  }
</style>
