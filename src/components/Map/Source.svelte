<script context="module">
  export const MB_SOURCE = {};
</script>

<script>
  import { onMount, getContext, setContext } from 'svelte';
  import { MAPBOX } from './Mapbox.svelte';
  import compare from 'just-compare';

  export let data;
  export let source;
  export let sourceId;

  const { getMap } = getContext(MAPBOX);
  let sourceAdded = false;
  let prevData;

  setContext(MB_SOURCE, {
    getSourceId: () => sourceId,
  });

  onMount(() => {
    const map = getMap();
    map.addSource(sourceId, {...source, data});
    sourceAdded = true;
    return () => map.style && map.removeSource(sourceId);
  });

  const updateSource = () => {
    if (!sourceAdded) return;

    const map = getMap();
    map.getSource(sourceId).setData(data);
  }

  $: {
    if (data && !compare(data, prevData)) {
      updateSource();
      prevData = data;
    }
  }
</script>

<slot></slot>
