<script>
  import { Mapbox, Layer, Source } from '../components/Map';
  import { MAPBOXGL_STYLEURL, MAPBOXGL_ACCESSTOKEN, project_title, endpointScannerSearch } from '../config.js';
  import state_coords from '../state_coords.js';
  import { exploreMachine } from '../services/explore_service.ts';
  import { aggregationStore } from '../stores/explore.ts';
  import { aggregations } from '../aggregations.js';

  let section = 'map';
  let items;

  const createGeoJsonFeature = ({ location: coord, key }) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [coord.lon, coord.lat],
    },
    properties: {
      name,
    },
  });

  const makeGeoJson = (items) => ({
    type: 'FeatureCollection',
    features: results.map(createGeoJsonFeature),
  })

  $: console.log($aggregationStore);
  exploreMachine.send({ type: 'SEARCHED', aggregations });
  $: items = $aggregationStore.find(({ key }) => key === 'amount_state_id');
  $: console.log(items)
  const unclusteredPoint = {
    id: "unclustered-point",
    type: "circle",
    source: "entities",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#db5e5e",
      "circle-radius": [

          '/',
          ['get', 'count'],
          5000

      ],
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff"
    }
  }

  const source = {
    type: "geojson",
  };
</script>

<svelte:head>
  <title>{project_title}</title>
</svelte:head>

<div class="content">
  {#if items && section === 'map'}
    <Mapbox
    bounds="{ [[-180,-90], [180, 90]]}"
    renderWorldCopies={false}
    apiKey="{MAPBOXGL_ACCESSTOKEN}"
    styleURL="{MAPBOXGL_STYLEURL}"
    pitchWithRotate={false}
  >
    <Source
      data="{items}"
      source="{source}"
      sourceId="entities"
    >
      <Layer layer="{unclusteredPoint}"/>

    </Source>
  </Mapbox>
  {/if}

</div>

<style>
   div {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
  }
</style>
