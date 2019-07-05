<script>
  import { createEventDispatcher } from 'svelte';
  import Spinner from './Spinner.svelte';
  import Alert from './Icons/Alert.svelte';

  import closeIcon from 'ionicons/dist/ionicons/svg/ios-close-circle-outline.svg';
  import addIcon from 'ionicons/dist/ionicons/svg/ios-add-circle-outline.svg';

  export let tabs,
    activeTab,
    tabHeight = 0,
    isLoading,
    isError;

  const dispatch = createEventDispatcher();
  let editedTarget = null;

  const handleDoubleClick = ({ target }) => {
    if (editedTarget) return;

    editedTarget = target;
    editedTarget.contentEditable = true;
    editedTarget.style.cursor = 'text';

    var range, selection;
    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(target);
      range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // various keypresses trigger window click events for accessibility reasons
  // we need to check to ensure the click event is coming from an actual click rather than a keypress
  // we can do this by checking the detail property of the event object. 0 means it was not a true click
  // we also need to ensure that such click events to not cause the element to lose focus

  const stopEdit = ({ target, type, keyCode, detail }) => {
    if (
      editedTarget === null ||
      (type === 'click' && detail === 0 && target === editedTarget) ||
      (type === 'click' && target === editedTarget)
    ) {
      editedTarget && editedTarget.focus();
      return;
    } else if (type === 'click' || keyCode === 13) {
      window.getSelection().removeAllRanges();
      editedTarget.blur();
      editedTarget.style.cursor = 'auto';
      editedTarget.contentEditable = false;
      editedTarget = null;
    }
  };
</script>

<svelte:window on:click|stopPropagation="{stopEdit}" />

<nav bind:offsetHeight="{tabHeight}">
  <ul>
    {#each tabs as [id, tab]}
      <li>
        <div
          on:click|preventDefault="{() => dispatch('changetab', id)}"
          on:dblclick="{handleDoubleClick}"
          on:keydown="{stopEdit}"
          on:input="{({ target }) => dispatch('textchange', { value: target.innerText, id })}"
          class:selected="{parseInt(id, 10) === activeTab}"
          class="button"
        >
          {tab.name}
        </div>

        {#if tabs.length > 1}
        <span on:click="{() => dispatch('deletetab', id)}" class="remove">
          <img alt="delete tab" src="{closeIcon}" />
        </span>
        {/if}
      </li>
    {/each}
    <li class="close-container">
      <span on:click="{() => dispatch('newtab')}" class="newtab remove">
        <img alt="create tab" src="{addIcon}"/>
      </span>
    </li>
  </ul>
  {#if isLoading }
    <span><Spinner/></span>
  {:else if isError}
    <span class="error"><Alert color="red"/></span>
  {/if}
</nav>

<style>
  span {
    height: 3.5rem;
    margin-top: -0.25rem;
  }

  .error {
    height: 2rem;
    width: 2rem;
    align-self: center;
    margin-right: 15px;
  }
  nav {
    border-bottom: 1px solid rgba(170, 30, 30, 0.1);
    font-weight: 300;
    padding: 0 1em;
    display: flex;
    justify-content: space-between;
    background: #fff;
    position: relative;
    z-index: 4;
    position: fixed;
    width: 100%;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* clearfix */
  ul::after {
    content: '';
    display: block;
    clear: both;
  }

  li {
    float: left;
    display: flex;
    align-items: center;
    border-right: 1px solid #ccc;
    padding: 0 10px;
  }

  .selected {
    position: relative;
    display: inline-block;
  }

  .selected::after {
    position: absolute;
    content: '';
    width: calc(100% - 1em);
    height: 2px;
    background-color: rgb(170, 30, 30);
    display: block;
    bottom: -1px;
  }

  .button {
    padding: 1em 0.5em;
    display: block;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.1em;
    font-weight: 200;
  }

  .remove {
    height: 22px;
    width: 22px;
    cursor: pointer;
    margin: 0 5px;
    opacity: 0.5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .remove:hover {
    opacity: 1;
  }

  .newtab {
    margin: auto;
    opacity: 1;
  }

  .close-container {
    flex-direction: column;
    justify-content: center;
    height: 100%;
    margin-left: 10px;
    border-right: none;
  }

  .remove img {
    width: 100%;
    height: 100%;
  }
</style>
