<script>
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import Spinner from './Spinner.svelte';
  import Alert from './Icons/Alert.svelte';

  import addIcon from 'ionicons/dist/ionicons/svg/ios-add-circle-outline.svg';
  import arrowForward from 'ionicons/dist/ionicons/svg/ios-arrow-forward.svg';
  import closeIcon from 'ionicons/dist/ionicons/svg/ios-close-circle-outline.svg';

  export let activeTab;
  export let isError;
  export let isLoading;
  export let tabHeight = 0;
  export let tabs;

  let editedTarget = null;
  let isFullWidth = false;
  let isLeft;
  let isRight;
  let navEl;
  let tabEls = [];
  let tabWidth;
  let windowWidth;

  const dispatch = createEventDispatcher();

  const calculateWidth = async () => {
    await tick();
    tabEls = tabEls.filter(v => !!v);
    tabWidth = [].reduce.call(tabEls, (a, n) => a + n.offsetWidth, 0)
    // accounts for margins, etc.
    isFullWidth =  tabWidth + 123 > windowWidth;
    isRight = (tabWidth - navEl.offsetWidth - navEl.scrollLeft) === 0;
    isLeft = navEl.scrollLeft === 0;
  }

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

  const newTab = async () => {
    dispatch('newtab')
    await tick();
    tabEls[tabEls.length - 1].scrollIntoView();
    calculateWidth();
  }

  const textChange = ({ target }, id) => {
    dispatch('textchange', { value: target.innerText, id });
    calculateWidth();
  }

  const deleteTab = async id => {
    dispatch('deletetab', id)
    calculateWidth();
  }

  onMount(calculateWidth)
</script>

<svelte:window
  on:click|stopPropagation="{stopEdit}"
  bind:innerWidth={windowWidth}
/>

<nav bind:offsetHeight="{tabHeight}">
  {#if isFullWidth}
    <div
      class="scroll scroll-left"
      style="opacity:{isLeft ? 0.3 : 1}"
      on:click={() => navEl.scrollLeft -= 100}
    >
      <span class="icon">
        <img alt="scroll tabs left" src="{arrowForward}"/>
      </span>
    </div>
  {/if}
  <ul bind:this={navEl} on:scroll={calculateWidth}>
    {#each tabs as [id, tab], i}
      <li bind:this={tabEls[i]}>
        <div
          on:click|preventDefault="{() => dispatch('changetab', id)}"
          on:dblclick="{handleDoubleClick}"
          on:keydown="{stopEdit}"
          on:input="{ e => textChange(e, id) }"
          class:selected="{parseInt(id, 10) === activeTab}"
          class="button"
        >
          {tab.name}
        </div>

        {#if tabs.length > 1}
        <span on:click="{() => deleteTab(id)}" class="icon">
          <img alt="delete tab" src="{closeIcon}" />
        </span>
        {/if}
      </li>
    {/each}

  </ul>
  {#if isFullWidth}
    <div
      class="scroll scroll-right"
      style="opacity:{isRight ? 0.3 : 1}"
      on:click={() => navEl.scrollLeft += 100}
    >
      <span class="icon">
        <img alt="scroll tabs left" src="{arrowForward}"/>
      </span>
    </div>
  {/if}
  <div
    class="close-container"
    class:sticky={isFullWidth}
    style="left:{isFullWidth ? 'unset' : `${tabWidth + 30}px`}"
  >
    <span on:click="{newTab}" class="newtab icon">
      <img alt="create tab" src="{addIcon}"/>
    </span>
  </div>
  {#if isLoading}
    <span><Spinner/></span>
  {:else if isError}
    <span class="error"><Alert color="red"/></span>
  {/if}
</nav>

<style lang="less">
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
    padding: 0 30px;
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
    display: flex;
    overflow-x: scroll;
    overflow-y: hidden;
    position: relative;
    margin-right: 64px;
    padding-right: 64px;
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
    flex-shrink: 0;
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
    margin: auto;
    opacity: 1;

    &:hover {
      opacity: 1;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }


  .scroll {
    position: fixed;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    border-right: none;
    height: 61px;
    height: 61px;
    width: 45px;
    border-left: 1px solid #ccc;
    background: #fff;
    z-index: 2;

    &.scroll-left {
      transform: rotate(180deg);
    }

    &.scroll-right {
      left: unset;
      right: 50px;
    }
  }



  .close-container {
    flex-direction: column;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    margin-left: 10px;
    border-right: none;
    position:fixed;
    height: 61px;
    //width: 60px;

    &.sticky {
      position: fixed;
      right: 0;
      top: 0;
      width: 50px;
      background: #fff;
      border-left: 1px solid #ccc;
    }
  }

</style>
