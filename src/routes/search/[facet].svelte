<script>
  import { getContext } from 'svelte';
  import { stores } from '@sapper/app';

  import { screenStore, currentTab } from '../../stores/search.ts';
  import { SEARCH } from './_layout.svelte';
  import {
    // list,
    map_geo,
    volume_countries,
    volume_funders,
    volume_geo,
    volume_terms
  } from './facets';

  const facets = {
    // list,
    map_geo,
    volume_countries,
    volume_funders,
    volume_geo,
    volume_terms
  };

  const {
    checkDirty,
    shouldResize,
    transitionComplete
  } = getContext(SEARCH);
  const { page } = stores();

  $: isDirty = $screenStore && checkDirty();
  $: $page && transitionComplete();
</script>

<svelte:component
  this={facets[$page.params.facet]}
  {isDirty}
  {shouldResize}
/>
