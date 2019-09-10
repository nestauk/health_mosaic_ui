<script>
  import { createEventDispatcher } from 'svelte';

  import { ArrowDown } from '../Icons/'
  import SelectionsPanel from './SelectionsPanel.svelte';

  const dispatch = createEventDispatcher();
  const shift = () => dispatch('shift');

  export let isSidebarLeft = true;
</script>

<div class="sidebar">
  <div>
    <slot name="sticky"></slot>
  </div>
  <div class="scrollable">
    <slot name="scrollable"></slot>
  </div>
  <div
    class="button"
    class:left={!isSidebarLeft}
    class:right={isSidebarLeft}
    on:click|stopPropagation={shift}
  >
    <ArrowDown />
  </div>
</div>

<style>
  .sidebar {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background: var(--color-sidebar-background);
    position: relative;
    user-select: none;
    display: flex;
    flex-direction: column;
  }

  /* div[slot="scrollable"] { */
  .scrollable {
    flex: 1;
    overflow-y: scroll;
    padding: var(--size-sidebar-padding);
  }

  :global(div[slot="scrollable"] > div:first-child) {
    margin-top: var(--size-sidebar-padding);
  }
  :global(div[slot="scrollable"] > div:not(:first-child)) {
    margin-top: calc(2* var(--size-sidebar-padding));
  }

  .button {
    height: 1.6rem;
    width: 1.6rem;
    position: absolute;
    bottom: 0;
    margin: var(--size-bars-padding);
    border: var(--border-sidebar);
    border-radius: 1rem;
    background-color: var(--color-button-background);
    box-shadow: var(--shadow-overlay);
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button.left {
    left: 0;
    transform: rotate(90deg);
  }

  .button.right {
    right: 0;
    transform: rotate(-90deg);
  }

  .button:hover {
    background-color: var(--color-highlight);
  }
</style>
