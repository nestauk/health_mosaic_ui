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

  export let apiKey,
    styleURL,
    bounds,
    map,
    interactive = true;

  let container,
    mapboxgl,
    loaded = false;

  setContext(MAPBOX, {
    getMap: () => map,
  });

  const dispatch = createEventDispatcher();

  const getBounds = () => map.getBounds().toArray();

  $: map && map.fitBounds(bounds, {}, { source: 'auto' });

  function txstart(mbEvent) {
    if (mbEvent.source !== 'auto') {
      dispatch('txstart');
    }
  }

  function txend(mbEvent) {
    if (mbEvent.source !== 'auto') {
      dispatch('txend', getBounds());
    }
  }

  onMount(async () => {
    mapboxgl = await import('mapbox-gl');
    mapboxgl = mapboxgl.default;
    mapboxgl.accessToken = apiKey;

    map = new mapboxgl.Map({
      interactive,
      container,
      style: styleURL,
      bounds: bounds,
    }).on('load', () => {
      map.on('movestart', txstart);
      map.on('moveend', txend);
      loaded = true;
    });
  });

  onDestroy(() => {
    if (!map) return;

    map.off('movestart', txstart);
    map.off('moveend', txend);

    map.remove();
  });
</script>

<svelte:head>
  <link href="./mapbox-gl.css" rel="stylesheet" />
</svelte:head>

<div bind:this="{container}" class="container">
  {#if loaded}
  <slot></slot>
  {/if}
</div>

<style>
  .container {
    height: 100%;
  }
</style>
