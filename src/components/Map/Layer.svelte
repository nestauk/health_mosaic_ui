<script>
  import { onMount, getContext, tick, createEventDispatcher } from 'svelte';
  import bbox from '@turf/bbox';

  import { MAPBOX } from './Mapbox.svelte';
  import { MB_SOURCE } from './Source.svelte';

  export let layer;
  let sourceId;

  const { getMap } = getContext(MAPBOX);
  const { getSourceId } = getContext(MB_SOURCE);
  const dispatch = createEventDispatcher();

  onMount(async () => {
    await tick();
    sourceId = getSourceId();
    layer.source = sourceId;

    const map = getMap();
    map.addLayer(layer);

    map.on('mouseenter', layer.id, () => {
      document.getElementsByClassName('mapboxgl-interactive')[0].style.cursor = 'pointer';
    })

    map.on('mouseleave', layer.id, () => {
      document.getElementsByClassName('mapboxgl-interactive')[0].style.cursor = 'auto';
    })

    map.on('click', layer.id, (e) =>  {
      var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features[0]) return;
      var clusterId = features[0].properties.cluster_id,
      point_count = features[0].properties.point_count,
      clusterSource = map.getSource(sourceId);
      let features_coords;

      clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, aFeatures){
        features_coords = bbox({
          type: 'FeatureCollection',
          features: aFeatures,
        });

        dispatch('clusterclick', [
          [features_coords[0], features_coords[1]],
          [features_coords[2], features_coords[3]]
        ]);

      })
    })

    return () => {
      map.style && map.removeLayer(layer.id)
    };
  });
</script>
