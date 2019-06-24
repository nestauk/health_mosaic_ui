<script>
  import { onMount, tick, getContext } from 'svelte';
  import { schemeSet3 } from 'd3-scale-chromatic';
  import { stores } from '@sapper/app';

  import BarchartV from '../../../components/BarchartV.svelte';
  import { WorldMapWithHistogramScaleHTML } from '../../../components/WorldMapWithHistogramScale';
  import { screenStore, currentTab  } from '../../../stores/search.ts';
  import {
    countByCity,
    countByCountryId,
    getKey,
    getValue,
    makeCountryIdToLabel
  } from '../../../util/domain';
  // import { SEARCH } from '../_layout.html';

  export let isDirty;

  // seems to be unneeded as it is in [facet] already, ok to remove?
  // const { page } = stores();
  // const { transitionComplete } = getContext(SEARCH);
  // $: $page && transitionComplete();

  $: items = $screenStore[$currentTab].results.data;
  $: itemsByCountryId = countByCountryId(items); // {key: country_id, value: number}[]
  $: itemsByCity = countByCity(items); // {key: city, value: number}[]
  $: countryLabels = makeCountryIdToLabel(items); // {id: country}[]
</script>

<div class="container" class:dirty="{isDirty}">
  <div class="col col1-2">
    <BarchartV
      title="Amount by country"
      items={itemsByCountryId}
    />
  </div>
  <div class="col col3-10">
    <WorldMapWithHistogramScaleHTML
      colors={schemeSet3}
      items={itemsByCountryId}
      keyAccessor="{getKey}"
      title="Amount by country"
      valueAccessor="{getValue}"
    />
  </div>
  <div class="col col11-12">
    <BarchartV
      title="Amount by city"
      items={itemsByCity}
    />
  </div>
</div>

<style lang="less">
  .container {
    /* padding-top: 16rem; */
    height: 100%;
    width: 100%;
    display: flex;

    flex: 1;
    height: 100%;
    max-height: 100%;

    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 100%;

    .col {
      height: 100%;
      max-height: 100%;

      &.col1-2 {
        grid-column: 1 / span 2;
      }
      &.col3-10 {
        grid-column: 3 / span 8;
      }
      &.col11-12 {
        grid-column: 11 / span 2;
      }

      &.col3-4 {
        grid-column: 3 / span 2;
      }
      &.col5-12 {
        grid-column: 5 / span 8;
      }
    }

    &.dirty {
      background-color: #fdfcef;
    }
  }
</style>
