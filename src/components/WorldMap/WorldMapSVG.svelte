<script context="module">
  import { feature } from 'topojson-client';
  import { setGeometryPrecision } from '@svizzle/geo';

  import worldBorders from '../../../data/geo/world_110m_iso_a2.json';

  // FIXME truncate after projection for perfs?
  const truncateGeojson = setGeometryPrecision(4);
  const geojson = truncateGeojson(
    feature(worldBorders, worldBorders.objects.countries)
  );
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import { geoPath } from 'd3-geo';
  import { geoCylindricalEqualArea } from 'd3-geo-projection';
  import * as _ from 'lamb';

  import { createColoredFeatures } from '../../util/geo';

  const dispatch = createEventDispatcher();

  export let height;
  export let items = []; // {key, value}
  export let key;
  export let keyToColor;
  export let width;
  export let selectedKeys = [];

  $: getFeatures = createColoredFeatures(keyToColor, key);
  $: features = getFeatures(geojson);
  $: projection = geoCylindricalEqualArea().fitSize([width, height], geojson);
  $: geopath = projection && geoPath(projection);
  $: exists = string => _.someIn(items, x => x.key === string);

  const clickedTarget = feature => () => {
    const id = feature.properties[key];
    exists(id) && dispatch('clickTarget', id);
  }
  const hasColor = feature => feature.properties.color;
  const isDeselected = feature =>
    selectedKeys &&
    selectedKeys.length &&
    !selectedKeys.includes(feature.properties[key]);
</script>

<svelte:options namespace="svg" />

<g class="worldmap">
  <rect
    {width}
    {height}
    on:click="{() => {dispatch('deselectAll')}}"
  />
  {#if geopath}
  {#each features as feature}
  <g class="feature">
    <path
      class:deselected="{isDeselected(feature)}"
      class:active="{hasColor(feature)}"
      d="{geopath(feature)}"
      fill="{hasColor(feature) || 'white'}"
      on:click="{clickedTarget(feature)}"
      on:mouseenter="{() => {dispatch('enterTarget', feature.properties[key])}}"
      on:mouseleave="{() => {dispatch('exitTarget', feature.properties[key])}}"
      stroke-dasharray="{feature.properties.color ? 'none' : '2 2'}"
    />
  </g>
  {/each}
  {/if}
</g>

<style lang="less">
  rect {
    fill-opacity: 0;
    cursor: pointer;
  }
  path {
    stroke: grey;
    stroke-width: 0.5;

    &.active {
      cursor: pointer;
    }
    &.deselected {
      fill-opacity: 0.25;
    }
  }
</style>
