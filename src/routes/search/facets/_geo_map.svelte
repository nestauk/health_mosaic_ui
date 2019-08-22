<script>
  import { getContext } from 'svelte';

  import { MAPBOXGL_STYLEURL, MAPBOXGL_ACCESSTOKEN } from '../../../config.js';
  import BarchartV from '../../../components/BarchartV.svelte';
  import Fallback from '../../../components/Fallback.svelte';
  import { Mapbox, Layer, Source, MapboxUnsupported } from '../../../components/Map/';

  import { screenStore, currentTab } from '../../../stores/search.ts';
  import { makeGeoJson } from '../../../util/geo.js';
  import { countByCityAsKeyValue } from '../../../util/domain';
  import { SEARCH } from '../_layout.svelte';

  const { select } = getContext(SEARCH);

  export let isDirty;

  $: selectedItems = $screenStore[$currentTab].selected;
  $: selectedItemsByCity = countByCityAsKeyValue(selectedItems);
  $: geoJson = makeGeoJson(selectedItems);
  $: bounds = $screenStore[$currentTab].selections.location &&
    $screenStore[$currentTab].selections.location.value;

  const source = {
    type: "geojson",
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  };

  const cluster = {
    id: "clusters",
    type: "circle",
    source: "institutions",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        100,
        "#f1f075",
        750,
        "#f28cb1"
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        100,
        30,
        750,
        40
      ]
    }
  };

  const clusterCount = {
    id: "cluster-count",
    type: "symbol",
    source: "institutions",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12
    }
  };

  const unclusteredPoint = {
    id: "unclustered-point",
    type: "circle",
    source: "institutions",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#db5e5e",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff"
    }
  }

  const selectBounds = ({ detail }) => select(
    { key: 'location', type: 'within', value: detail },
    $currentTab
  );
</script>

<div class="container" class:dirty="{isDirty}">
  <div class="col col1">
    <Mapbox
      bounds="{ bounds || [[-180,-90], [180, 90]]}"
      renderWorldCopies={false}
      apiKey="{MAPBOXGL_ACCESSTOKEN}"
      styleURL="{MAPBOXGL_STYLEURL}"
      pitchWithRotate={false}
      on:zoomend={selectBounds}
      on:txend={selectBounds}
    >
      <Source
        data="{geoJson}"
        source="{source}"
        sourceId="entities"
      >
        <Layer layer="{unclusteredPoint}"/>
        <Layer
          layer="{cluster}"
          on:clusterclick={selectBounds}
        />
        <Layer layer="{clusterCount}"/>
      </Source>
    </Mapbox>
  </div>
  <div class="col col2">
    <BarchartV
      title="Amount by city"
      items={selectedItemsByCity}
    />
    {#if !selectedItems.length}
    <div class="col overlay">
      <Fallback message="No results" />
    </div>
    {/if}
  </div>
</div>

<style lang="less">
  .container {
    height: 100%;
    width: 100%;
    transform-origin: 0 0;
    padding: 0 1em 0 0;

    max-height: 100%;

    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 100%;

    .col {
      height: 100%;
      max-height: 100%;

      &.col1 {
        grid-column: 1 / span 10;
      }
      &.col2 {
        grid-column: 11 / span 2;
        position: relative;

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          pointer-events: none;
        }
      }
    }

    &.dirty {
      border: 1px solid red;
    }
  }
</style>
