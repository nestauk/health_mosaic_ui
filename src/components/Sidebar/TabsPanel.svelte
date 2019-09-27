
<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    AlertTriangleIcon,
    CheckSquareIcon,
    CopyIcon,
    EditIcon,
    PlusCircleIcon,
    Share2Icon,
    SquareIcon,
    Trash2Icon
  } from 'svelte-feather-icons';
  import { extent } from 'd3-array';
  import * as _ from 'lamb'

  import { version } from '../../../package.json';
  import { makeRouteUrl, serialiseTabs } from '../../util/url/utils';
  import { Alert, ArrowDown } from '../Icons/';
  import Spinner from '../Spinner.svelte';
  import StatusBar from '../StatusBar.svelte';

  const dispatch = createEventDispatcher();
  const panelHeight = 200;

  export let activeTab;
  export let editingTab = null;
  export let tabs;
  export let screenStore;

  let editedTarget = null;
  let lastSelected;
  let hasMoreAbove = false;
  let hasMoreBelow = false;
  let tabsContainer;
  let tabsHeight = 0;
  let selectedTabs = [];
  let statusText = '';
  let shift = false;

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

  const deselectTab = id => {
    let el = selectedTabs.findIndex(_id =>_id === id);
    if (el < 0) {
      return
    };
    selectedTabs.splice(el, 1);
    selectedTabs = selectedTabs;
  }

  const createTab = async () => {
    dispatch('newtab');
    await tick();
    tabScroll({ target: tabsContainer });
  }

  const textChange = ({ target }, id) => {
    dispatch('textchange', { value: target.innerText, id });

    // Updating the URL cause the DOM elemen to lose focus
    // We need to wait until the state has been updated and the changes have been flushed before refocusing
    // One requestAnimationFrame doesn't seem to manage it
    // queueing a new Task doesn't seem to work either

    requestAnimationFrame(
      () => requestAnimationFrame(() => editedTarget.focus())
    );
  }

  const deleteTabs = async id => {
    dispatch('deleteTabs', selectedTabs)
    selectedTabs = [];
  }

  const deleteTab = (id) => {
    deselectTab(+id);
    dispatch('deleteTabs', [+id]);
  }

  const hoverOn = i => {
    tabs[i].hoveringTitle = true;
    tabs[i].hovering = false;
  }

  const hoverOff = i => {
    tabs[i].hoveringTitle = false;
    tabs[i].hovering = true;
  }

  const duplicateTabs = ({ detail }) => {
    if (!selectedTabs.length) {
      return;
    }

    dispatch('duplicatetabs', selectedTabs);
    selectedTabs = [];
  }

  const duplicateTab = id => {
    dispatch('duplicatetabs', [id]);
  }

  const tabScroll = ({ target }) => {
    if (target.scrollTop > 0) {
      hasMoreAbove = true;
    } else {
      hasMoreAbove = false;
    }

    if (tabsHeight >= panelHeight && target.scrollTop + tabsHeight < target.scrollHeight) {
      hasMoreBelow = true;
    } else {
      hasMoreBelow = false;
    }
  }

  const toggleAll = () => {
    if (selectedTabs.length) {
       selectedTabs = [];
    } else {
       selectedTabs = tabs.map(({ id }) => id);
    }
  }

  const findTabIndex = id => tabs.findIndex(tab => tab.id === id);

  const checkSelectedRange = (current, last) => {
    const [low, high] = extent([current, last]);
    let allSelected = true;

    for (let j = low; j <= high; j++) {
      allSelected = j === last || selectedTabs.includes(tabs[j].id);
      if (!allSelected) {
        break;
      }
    }

    return allSelected;
  }

  const inputClick = id => e => {
    if (shift) {
      const currentIndex = findTabIndex(id);
      const lastIndex = findTabIndex(lastSelected);
      let includedTabs = [];

      if (checkSelectedRange(currentIndex, lastIndex)) {
        const [low, high] = extent([currentIndex, lastIndex]);

        includedTabs = [...selectedTabs];
        for (let i = low; i <= high; i++) {
          includedTabs = includedTabs.filter(_id => _id !== tabs[i].id);
        }

      } else {
        const indices = tabs.reduce((acc, tab, i) => {
          if (selectedTabs.includes(tab.id)) { acc.push(i) }

          return acc;
        }, []);

        const [ minSelected, maxSelected ] = extent(indices);
        const min = minSelected <= currentIndex ? minSelected : currentIndex;
        const max = maxSelected >= currentIndex ? maxSelected : currentIndex;

        for (let i = min; i <= max; i++) {
          includedTabs.push(tabs[i].id);
        }
      };

      selectedTabs = includedTabs;
    }
    lastSelected = id;
  };

  const  copyToClipboard = text => {
    if (window.clipboardData && window.clipboardData.setData) {
      return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
      var textarea = document.createElement("textarea");
      textarea.textContent = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.select();
      try {
          return document.execCommand("copy");
      } catch (err) {
          console.warn("Copy to clipboard failed.", err);
          return false;
      } finally {
          document.body.removeChild(textarea);
      }
    }
  };


  const shareTabs = (tabsToShare = selectedTabs) => {
    const sharedTabs = _.pipe([
      _.pairs,
      _.filterWith(([id]) => tabsToShare.includes(+id)),
      _.fromPairs
    ])(screenStore);

    const serialisedTabs = serialiseTabs(sharedTabs);
    const urlQuery = {
      v: version,
      active: tabsToShare.includes(activeTab) ? activeTab : tabsToShare[0],
      tabs: serialisedTabs,
    };
    const path = `
      ${window.location.origin}${makeRouteUrl(screenStore[activeTab].route, urlQuery)}
    `;

    const copied = copyToClipboard(path);
    if (copied) {
      const tabNames = _.pipe([
        _.pairs,
        _.mapWith(([,{ name }]) => `"${name}"`),
        x => x.join(', ')
      ])(sharedTabs);

      statusText = `Link copied.`;
    } else {
      statusText = `There was a problem creating a share link. Please try again.`;
    }
  }

  const shareTab = id => shareTabs([id]);
</script>

<svelte:window
  on:click|stopPropagation="{stopEdit}"
  on:keydown={({ key }) => key === 'Shift' && (shift = true)}
  on:keyup={({ key }) => key === 'Shift' && (shift = false)}
/>

<nav>
  <h2>Tabs</h2>
  <div class="tab-wrap">

    {#if hasMoreAbove}
      <span
        transition:fade
        class="scrollicons up"
      >
        <ArrowDown />
      </span>
    {/if}

    <ul
      style="max-height:{panelHeight}px;"
      bind:offsetHeight={tabsHeight}
      bind:this={tabsContainer}
      on:scroll={tabScroll}
    >
      {#each tabs as { hovering, hoveringTitle, id, isError, isLoading, name }, i (id)}
        <li
          class:selected="{id === activeTab}"
          on:click|preventDefault="{() => dispatch('changetab', id)}"
          on:mouseenter="{() => tabs[i].hovering = true}"
          on:mouseleave="{() => tabs[i].hovering = false}"
        >
          {#if hoveringTitle}
            <span class="edittab">
              <EditIcon />
            </span>
          {/if}
          <div
            on:click|stopPropagation="{e => handleClick(e, id)}"
            on:keydown="{stopEdit}"
            on:input="{ e => textChange(e, id) }"
            on:mouseenter="{() => hoverOn(i)}"
            on:mouseleave="{() => hoverOff(i)}"
            class="button"
          >
            {name}
          </div>
          <span
            on:click|stopPropagation={() => {}}
            class="icon-container"
          >
            {#if isLoading}
              <Spinner />
            {/if}
            {#if isError}
              <AlertTriangleIcon />
            {/if}
            {#if hovering}
              <span
                class="icon delete"
                on:mouseenter={() => statusText="Copy this tab’s link to your clipboard"}
                on:click|stopPropagation={() => hovering && shareTab(id)}
              >
                <Share2Icon />
              </span>

              <span
                class="icon delete"
                on:mouseenter={() => statusText="Duplicate tab"}
                on:click|stopPropagation={() => hovering && duplicateTab(id)}
              >
                <CopyIcon />
              </span>

              {#if tabs.length > 1}
                <span
                  class="icon delete"
                  on:mouseenter={() => statusText = "Delete tab"}
                  on:click|stopPropagation={() => hovering && deleteTab(id)}
                >
                  <Trash2Icon />
                </span>
              {/if}
            {/if}
          </span>

        {#if tabs.length > 1}
          <input
              title="Select tab"
              type="checkbox"
              on:mouseenter={() => statusText = "Select tab"}
              bind:group={ selectedTabs}
              value={id}
              on:click|stopPropagation={inputClick(id)}
            />
        {/if}
      </li>
    {/each}
  </ul>
    {#if hasMoreBelow}
      <span
        transition:fade
        class="scrollicons"
      >
        <ArrowDown />
      </span>
    {/if}
  </div>
  <StatusBar bind:text={statusText}/>

  <div class="close-container">

    {#if tabs.length > 1}
      <span
        title="Copy selected tab’s links to your clipboard"
        on:mouseenter={() => statusText = "Copy selected tab’s links to your clipboard"}
        class:no-tabs="{selectedTabs.length === 0}"
        on:click="{() => shareTabs()}"
        class="icon"
      >
        <Share2Icon />
      </span>
      <span
        title="Duplicate selected Tab(s)"
        on:mouseenter={() => statusText = "Duplicate selected Tab(s)"}
        class:no-tabs="{selectedTabs.length === 0}"
        on:click="{duplicateTabs}"
        class="icon"
      >
        <CopyIcon />
      </span>

      <span
        title="Delete selected tab(s)"
        on:mouseenter={() => statusText = "Delete selected tab(s)"}
        class:no-tabs="{selectedTabs.length === 0}"
        on:click="{() => deleteTabs(activeTab)}"
        class="icon"
      >
        <Trash2Icon size="{1.5}"/>
      </span>
    {/if}
    <span
      title="Create a new tab"
      on:mouseenter={() => statusText = "Create a new tab"}
      on:click="{createTab}"
      class="icon"
    >
      <PlusCircleIcon size="{1.5}"/>
    </span>
    {#if tabs.length > 1}
      <span
        title="Duplicate selected tab(s)"
        on:mouseenter={() => statusText = "Select/ deselect all tabs"}
        on:click="{toggleAll}"
        class="icon duplicate"
      >
        {#if selectedTabs.length}
          <SquareIcon size="{1.5}"/>
        {:else }
          <CheckSquareIcon size="{1.5}"/>
        {/if}
      </span>
    {/if}
  </div>
</nav>

<style lang="less">
  span {
    height: 3.5rem;
    margin-top: -0.25rem;
    display: block;
  }

  h2 {
    margin: var(--size-sidebar-padding);
    font-size: var(--size-sidebar-panel-title);
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
    overflow-y: scroll;
    border-bottom: 1px solid #eee;
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



    .icon {
      height: 1.5rem;
      width: 3rem;
      margin: 1px 8px 0 0;

      &:last-child {
        margin-right: 0;
      }
    }

    .delete {
      height: 18px;
      width: 18px;
    }

    .error {
      margin-left: auto;
      cursor: auto;
      display: flex;
      flex-direction: row;
    }

    .edittab {
      position: absolute;
      left: 9px;
      width: 15px;
      top: -8px;
    }
  }

  .icon-container {
    height: 1.5rem;
    margin-right: 4px;
    padding-top: 3px;
    display: flex;
    margin-left: auto;
    align-items: center;

    & :global(svg) {
      width: 1.5rem;
      margin-right: 8px;
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
    display: block;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.1em;
    white-space: nowrap;
    overflow: hidden;
    height: 2.1rem;
    min-width: 3rem;
    display: flex;
    align-items: center;
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

    &.duplicate {
      position: absolute;
      right: 0;
    }

    &.no-tabs {
      opacity: 0.5;
    }
  }

  .close-container {
    display: flex;
    justify-content: center;
    height: 100%;
    border-right: none;
    margin: 0px 0 15px 0;
    position: relative;
  }

  .tab-wrap {
    position: relative;
  }

  .scrollicons {
    position: absolute;
    right: 7.5px;
    bottom: -24px;
    height: 1.2rem;
    opacity: 0.5;

    &.up {
      bottom: unset;
      top: -24px;
      transform: rotate(180deg);
    }
  }

</style>
