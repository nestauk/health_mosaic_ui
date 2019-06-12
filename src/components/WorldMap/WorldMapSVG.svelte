<script>
  import { createEventDispatcher } from 'svelte';
  import { geoPath } from 'd3-geo';
  import { geoCylindricalEqualArea } from 'd3-geo-projection';
  import { feature } from 'topojson-client';
  import { setGeometryPrecision } from '@svizzle/geo';
  import * as _ from 'lamb';

  import worldBorders from '../../../data/geo/world_110m_iso_a2.json';
  import { createColoredFeatures } from '../../util/geo';

  const dispatch = createEventDispatcher();
  const truncateGeojson = setGeometryPrecision(4);
  const geojson = truncateGeojson(
    feature(worldBorders, worldBorders.objects.countries)
  );

  export let height;
  export let items = [];
  export let key;
  export let keyToColor;
  export let width;

  $: getFeatures = createColoredFeatures(keyToColor, key);
  $: features = getFeatures(geojson);
  $: projection = geoCylindricalEqualArea().fitSize([width, height], geojson);
  $: geopath = projection && geoPath(projection);
</script>

<svelte:options namespace="svg" />

<g class="worldmap">
  {#if geopath}
  {#each features as feature}
  <g class="feature">
    <path
      d="{geopath(feature)}"
      fill="{feature.properties.color || 'white'}"
      stroke-dasharray="{feature.properties.color ? 'none' : '2 2'}"
      on:mouseenter="{() => {dispatch('enter', feature.properties[key])}}"
      on:mouseleave="{() => {dispatch('exit')}}"
    />
  </g>
  {/each}
  {/if}
</g>

<style lang="less">
  path {
    stroke: grey;
    stroke-width: 0.5;
  }
</style>
