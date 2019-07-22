<script>
  import { getContext } from 'svelte';
  import { Mapbox, Layer, Source } from '../../../components/Map';
  import { MAPBOXGL_STYLEURL, MAPBOXGL_ACCESSTOKEN } from '../../../config.js';
  import { makeGeoJson } from '../../../util/geo.js';

  import { screenStore, currentTab } from '../../../stores/search.ts';
  import { SEARCH } from '../_layout.svelte';

  const { select } = getContext(SEARCH);

  $: geoJson = makeGeoJson($screenStore[$currentTab].selected);
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

<div>
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

<style>
  div {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
  }
</style>
