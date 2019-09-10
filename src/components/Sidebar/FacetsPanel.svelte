<script>
  import { createEventDispatcher } from 'svelte';

  import { stores } from '@sapper/app';

  import { project_title, searchRouteName } from '../../config.js';
  import RouterLink from '../RouterLink.svelte';

  const { page } = stores();
  const dispatch = createEventDispatcher();

  export let facets;

  $: currentFacet = $page.path.split('/').filter(Boolean)[1] || '';
</script>

<div class="FacetsPanel">
  <h2>Facets</h2>
  <ul>
    {#each facets as { id, label }}
    <li class:selected={id === currentFacet}>
      <RouterLink
        on:navigate="{() => dispatch('link', id)}"
        base={searchRouteName}
        href={id}
      >
        <div>{label}</div>
      </RouterLink>
      </li>
    {/each}
  </ul>
</div>

<style lang="less">
  .FacetsPanel {
    /* margin: 2rem 0; */
  }
  h2 {
    font-size: var(--size-sidebar-panel-title);
  }
  ul {
    padding: 0 0px;
    list-style: none;
    /* padding-left: 0; */
    display: flex;
    flex-wrap: wrap;

    li {
      font-weight: 400;
      padding: 3px 5px;
      margin: 3px 5px;
      padding: 0.2rem 0.8rem;
      border-radius: 2em;
      background: #eee;

      &.selected {
        background: var(--color-highlight)!important;
        font-weight: 400!important;
      }

      &:hover {
        background: #ddd;
        cursor: pointer;
      }
    }
  }
</style>
