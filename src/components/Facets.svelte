<script>
  // import { Globe, Volume, Clock } from './Icons.js';
  import { createEventDispatcher } from 'svelte';
  import { stores } from '@sapper/app';
  import RouterLink from './RouterLink.svelte';
  import { project_title, searchRouteName } from '../config.js';

  export let facets;

  const { page } = stores();
  const dispatch = createEventDispatcher();

  $: current_facet = $page.path.split('/').filter(Boolean)[1];
  // $: console.log(current_facet)

</script>
<div class="container">
  <h2>Facets</h2>
	<ul>

			{#each facets as { id, label }}
      <li class:selected={id === current_facet}>
        <RouterLink
            on:navigate={() => dispatch('link', id)}
            base={searchRouteName}
            href={id}
          >
          <div>{label}</div>
        </RouterLink>
        </li>
      {/each}

	</ul>
</div>

<!--
List
Volume by Country
Locations
Volume by Term
Volume by Mentioned Countries
Fynder
-->

<style lang="less">
  .container {
    margin: 2rem 0;
  }
  h2 {
    font-size: 1.3rem;
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

      a {
        text-decoration: none;
      }

      &.selected {
        background: var(--highlight) !important;
        color: #333!important;
        font-weight: 400!important;
      }

      &:hover {
        background: #ddd;
        cursor: pointer;
      }
    }
	}



</style>
