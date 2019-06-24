<script>
  import { onMount, getContext } from 'svelte';
  import { MAPBOX } from './Mapbox.svelte';
  import { MB_SOURCE } from './Source.svelte';

  export let layer;
  let sourceId;

  const { getMap } = getContext(MAPBOX);
  const { getSourceId } = getContext(MB_SOURCE);

  onMount(() => {
    sourceId = getSourceId();
    layer.source = sourceId;

    const map = getMap();
    map.addLayer(layer);

    return () => map.style && map.removeLayer(layer.id);
  });
</script>
