<script context="module">
  export const MAPBOX = {};
</script>

<script>
  import {
    onMount,
    onDestroy,
    createEventDispatcher,
    setContext,
  } from 'svelte';

  import Fallback from '../Fallback.svelte';
  import MapboxUnsupported from './MapboxUnsupported.svelte';

  export let apiKey;
  export let bounds;
  export let interactive = true;
  export let map;
  export let padding = 30;
  export let pitchWithRotate = true;
  export let renderWorldCopies = true;
  export let styleURL;
  export let seaColor = 'white';

  let container;
  let isMapboxGLSupported = true;
  let loaded = false;
  let mapboxgl;

  setContext(MAPBOX, {
    getMap: () => map,
  });

  const dispatch = createEventDispatcher();

  const getBounds = () => map.getBounds().toArray();

  $: map && map.fitBounds(bounds, { padding }, { source: 'auto' });

  const createEvent = svEvent => mbEvent => {
    if (mbEvent.source !== 'auto') {
      const sw = map.unproject([padding, map._container.offsetHeight - padding]);
      const ne = map.unproject([map._container.offsetWidth - padding, padding])

      dispatch(svEvent, [[sw.lng, sw.lat], [ne.lng, ne.lat]]);
    }
  }

  const txstart = createEvent('txstart');
  const txend = createEvent('txend');
  const zoomstart = createEvent('zoomstart');
  const zoomend = createEvent('zoomend');

  onMount(async () => {
    mapboxgl = await import('mapbox-gl');
    mapboxgl = mapboxgl.default;
    mapboxgl.accessToken = apiKey;

    isMapboxGLSupported = mapboxgl.supported();

    if (isMapboxGLSupported) {
      map = new mapboxgl.Map({
        interactive,
        container,
        style: styleURL,
        bounds: bounds,
        renderWorldCopies,
        pitchWithRotate,
        maxZoom: 15
      }).on('load', () => {
        map.on('movestart', txstart);
        map.on('moveend', txend);
        map.on('zoomstart', zoomstart);
        map.on('zoomend', zoomend);
        map.setPaintProperty('water', 'fill-color', seaColor)
        loaded = true;
      });
    }
  });

  onDestroy(() => {
    if (!map) return;

    map.off('movestart', txstart);
    map.off('moveend', txend);
    map.off('zoomstart', zoomstart);
    map.off('zoomend', zoomend);

    map.remove();
  });
</script>

<svelte:head>
  <link href="./mapbox-gl.css" rel="stylesheet" />
</svelte:head>

<div bind:this="{container}" class="container">
  {#if !isMapboxGLSupported}
    <Fallback>
      <MapboxUnsupported/>
    </Fallback>
  {:else if loaded}
    <slot></slot>
  {/if}
</div>

<style>
  .container {
    height: 100%;
  }
</style>
