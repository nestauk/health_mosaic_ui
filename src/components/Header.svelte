<script>
  import { stores } from '@sapper/app';
  import * as _ from 'lamb';

  import { project_title } from '../config.js';
  import RouterLink from '../components/RouterLink.svelte';
  import { ArrowDown } from '../components/Icons/';

  const { page } = stores();
  const navLinks = [
    {type: 'text', href: 'about', text: 'About'},
    {type: 'text', href: 'data', text: 'Data'},
    {type: 'text', href: 'methodology', text: 'Methodology'},
    {type: 'text', href: 'features', text: 'Features'},
    {type: 'text', href: 'search', text: 'Search'},
  ];

  export let matchingMqStore;

  let isNarrow;
  $: matchingMqStore && matchingMqStore.subscribe(
    ({key, value}) => {
      isNarrow =
        (key === 'wt' && value < 640) ||
        (key === 'nt' && value <= 640)
    }
  );

  $: pageId = $page.path.slice(1);
  $: menuHeadItem = isNarrow && _.find(navLinks, x => x.href === pageId);
  $: showMenu = isNarrow && false; // hide the menu when `isNarrow` changes

  const toggleMenu = () => {
    showMenu = !showMenu;
  }
</script>

<div class="container">
  <RouterLink href="">
    <div class="home">
      <img
        src="/logo_mosaic_512.png"
        alt="Logo {project_title}"
      />
      <span>HealthMosaic</span>
    </div>
  </RouterLink>
  {#if isNarrow}
    <div class="nav">
      {#if menuHeadItem}
      <div class="navLink {menuHeadItem.type}">
        <span>{menuHeadItem.text}</span>
      </div>
      {/if}

      <div
        class="navLink hoverable toggle"
        class:left={!showMenu}
        on:click={toggleMenu}
      >
        <ArrowDown color="rgb(15,51,102)"/> <!-- var(--color-text) -->
      </div>

      {#if showMenu}
      <div class="menu">
        {#each navLinks as {href, text, type}}
        <RouterLink {href} style="width:100%">
          <div class="navLink hoverable {type}">
            <span>{text}</span>
          </div>
        </RouterLink>
        {/each}
      </div>
      {/if}
    </div>
  {:else}
    <div class="nav">
      {#each navLinks as {href, text, type}}
      <RouterLink {href}>
        <div
          class="navLink {type}"
          class:hoverable="{href !== pageId}"
          class:highlighted="{href === pageId}"
        >
          <span>{text}</span>
          <div class="mark"></div>
        </div>
      </RouterLink>
      {/each}
    </div>
  {/if}
</div>

<style lang="less">
  .container {
    width: 100%;
    height: 100%;
    border-bottom: 1px solid var(--color-ui-border);

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--size-bars-padding);
    position: relative;

    .home {
      height: 100%;
      display: flex;
      align-items: center;

      img {
        width: var(--size-header-innerheight);
        height: var(--size-header-innerheight);
        border-radius: calc(var(--size-header-innerheight) / 2);
        margin-right: var(--size-bars-padding);
      }
      span {
        font-size: 1.3em;
        font-weight: 300;
        color: var(--color-text);
      }
    }

    .nav {
      height: 100%;
      display: flex;
      align-items: center;
      user-select: none;

      .menu {
        width: 180px;
        position: absolute;
        top: var(--size-header-height);
        right: 0;
        background-color: white;
        box-shadow: var(--color-ui-shadow) -2px 5px 7px -3px;

        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: flex-start;
        z-index: var(--z-index-menu);

        .navLink {
          padding: calc(0.6em + var(--size-bars-padding));

          &.hoverable {
            &:hover {
              background-color: var(--color-text-highlight-bkg);
            }
          }
        }
      }

      .navLink {
        padding: 0.6em;
        font-weight: 300;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &.hoverable {
          &:hover {
            .mark {
              display: block;
              background-color: var(--color-text-highlight-bkg);
            }
          }
        }

        &.highlighted {
          .mark {
            display: block;
          }
        }

        .mark {
          display: none;
          position: absolute;
          bottom: calc(-1px - var(--size-bars-padding));
          width: 100%;
          height: 6px;
          background-color: var(--color-nav-current);
        }

        &.button {
          border-radius: 8px 0 10px 0;
          background-color: var(--color-text);
          color: white;
          padding: 0.5em 0.6em;
        }
        &.text {
          width: 100%;
          color: var(--color-text);
        }
        &.toggle {
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0.6em;
          cursor: pointer;

          &.left {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
</style>
