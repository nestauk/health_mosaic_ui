<script>
  import { onMount, tick, getContext } from 'svelte';
  import { schemeSet3 } from 'd3-scale-chromatic';
  import * as _ from 'lamb';
  import { stores } from '@sapper/app';

  import { countries } from '../../../../data/geo/iso_a2_to_name_by_type.json';
  import BarchartV from '../../../components/BarchartV.svelte';
  import { WorldMapWithHistogramScaleHTML } from '../../../components/WorldMapWithHistogramScale';
  import { screenStore, currentTab } from '../../../stores/search.ts';
  import { countByCity, countByCountryId } from '../../../util/domain';
  import { getKey, getValue } from '../../../util/object.any';
  import { SEARCH } from '../_layout.svelte';

  const { select } = getContext(SEARCH);

  export let isDirty;

  $: items = $screenStore[$currentTab].results.data;
  $: itemsByCountryId = countByCountryId(items); // {key: country_id, value: number}[]
  $: selections = $screenStore[$currentTab].selections;
  $: selectedCountries = (selections.country_id && selections.country_id.value) || [];
  $: selectedItems = $screenStore[$currentTab].selected;
  $: selectedItemsByCountry = countByCountryId(selectedItems); // {key: country_id, value: number}[]
  $: selectedItemsByCity = countByCity(selectedItems);

  // TODO utils?
  const updateSelections = ({ detail: selection }) =>
    select( selection, $currentTab );

  const deselectCountries = () => select(
    { key: 'country_id', value: undefined },
    $currentTab
  );
</script>

<div class="container" class:dirty="{isDirty}">
  <div class="col col1-2">
    <BarchartV
      title="Amount by country"
      items={selectedItemsByCountry}
      labels={countries}
    />
  </div>
  <div class="col col3-10">
    <WorldMapWithHistogramScaleHTML
      colors={schemeSet3}
      items={itemsByCountryId}
      keyAccessor="{getKey}"
      on:selected="{updateSelections}"
      on:deselectAll="{deselectCountries}"
      selectedKeys="{selectedCountries}"
      title="Amount by country"
      valueAccessor="{getValue}"
    />
  </div>
  <div class="col col11-12">
    <BarchartV
      title="Amount by city"
      items={selectedItemsByCity}
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
