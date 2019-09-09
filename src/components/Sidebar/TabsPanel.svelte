
<script>
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import Spinner from '../Spinner.svelte';
  import Alert from '../Icons/Alert.svelte';
  import { EditIcon, CopyIcon, PlusCircleIcon, Trash2Icon } from 'svelte-feather-icons';

  import addIcon from 'ionicons/dist/ionicons/svg/ios-add-circle-outline.svg';
  import arrowForward from 'ionicons/dist/ionicons/svg/ios-arrow-forward.svg';
  import closeIcon from 'ionicons/dist/ionicons/svg/ios-close-circle-outline.svg';

  export let activeTab;
  export let editingTab;
  export let isError;
  export let isLoading;
  export let tabs;

  let editedTarget = null;
  let tab_status = [];

  const dispatch = createEventDispatcher();

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
      editedTarget.style.cursor = 'pointer';
      editedTarget.contentEditable = false;

      if (editedTarget.innerText === '') {
        editedTarget.innerText = `Tab ${+editingTab + 1}`;
        dispatch('textchange', { value:`Tab ${+editingTab + 1}`, id: editingTab });
      }

      editedTarget = null;
    }
  };

  const handleClick = async (e, id) => {
    const { target } = e;

    if (editedTarget === target) return;
    editingTab = id;

    stopEdit(e);

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

  const registerTabs = (node, id) => {

    function toggleChecked(e) {
      if (e.target.checked) {
        tab_status.push(parseInt(id, 10));
        tab_status = tab_status;
      } else {
        let el = tab_status.findIndex(_id =>_id === parseInt(id, 10));
        tab_status.splice(el, 1);
        tab_status = tab_status;
      }

    }

    node.addEventListener('change', toggleChecked);

    return {
      destroy: () => node.removeEventListener('change', toggleChecked)
    }
  }

  const newTab = async () => {
    dispatch('newtab')
    await tick();
  }

  const textChange = ({ target }, id) => {
    dispatch('textchange', { value: target.innerText, id });
  }

  const duplicateTabs = async id => {
    dispatch('duplicatetab', tab_status)
  }

  const deleteTabs = async id => {
    dispatch('deletetab', tab_status)
    tab_status = tab_status.length === tabs.length ? [tab_status[0]] : [];
  }
</script>

<svelte:window
  on:click|stopPropagation="{stopEdit}"
/>

<nav>
  <h2>Tabs</h2>
  <ul>
    {#each tabs as { id, name, isLoading, hovering }, i (id)}
      <li
        class:selected={parseInt(id, 10) === activeTab}
        on:click|preventDefault={() => dispatch('changetab', parseInt(id, 10))}
      >
        {#if hovering}
          <span>
            <EditIcon />
          </span>
        {/if}
        <div
          on:click|stopPropagation={e => handleClick(e, id)}
          on:keydown={stopEdit}
          on:input={ e => textChange(e, id) }
          on:mouseenter={() => tabs[i].hovering = true}
          on:mouseleave={() => tabs[i].hovering = false}
          class="button"
        >
          {name}
        </div>
        {#if isLoading}
          <Spinner />
        {/if}
        <input
          title="Select tab"
          on:click|stopPropagation
          use:registerTabs={id}
          type="checkbox"
        />
      </li>
    {/each}

  </ul>
  <div
    class="close-container"
  >
    <span
      title="New tab"
      on:click={newTab}
      class="icon"
    >
      <PlusCircleIcon size={1.5}/>
    </span>
    {#if tabs.length > 1}
    <span
      title="Delete selected tab(s)"
      class:no-tabs={tab_status.length === 0}
      on:click={() => deleteTabs(activeTab)}
      class="icon"
    >
      <Trash2Icon size={1.5}/>
    </span>
    {/if}
  </div>
</nav>

<style lang="less">
  span {
    height: 3.5rem;
    margin-top: -0.25rem;
  }

  h2 {
    margin: 1rem;
  }

  nav {
    border-bottom: 1px solid rgba(170, 30, 30, 0.1);
    font-weight: 300;
    display: flex;
    flex-direction: column;
    background: var(--color-sidebar-background);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  li {
    float: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding-left: 1.8em;
    cursor: pointer;
    position: relative;

    span {
      position: absolute;
      left: 9px;
      width: 15px;
      top: -8px;
    }
  }

  li input {
    margin-right: 1em
  }

  li:nth-child(even) {
    border-bottom: 1px solid #eee;
    border-top: 1px solid #eee;
  }

  .selected {
    background: var(--color-highlight)!important;
  }

  .button {
    padding: 0.2em 0em;
    display: block;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.1em;
    white-space: nowrap;
    overflow: hidden;
    height: 2.1rem;
    min-width: 3rem;
  }


  .icon {
    height: 22px;
    width: 22px;
    cursor: pointer;
    margin: 0 5px;
    opacity: 0.5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 1;

    &.no-tabs {
      opacity: 0.5;
    }

    &:hover {
      opacity: 1;
    }
  }

  .close-container {
    display: flex;
    justify-content: center;
    height: 100%;
    margin-left: 10px;
    border-right: none;
    margin: 15px 0;
  }

</style>
