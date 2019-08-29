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
  import { geoPath, geoGraticule } from 'd3-geo';
  import { geoCylindricalEqualArea } from 'd3-geo-projection';
  import * as _ from 'lamb';

  import { createColoredFeatures } from '../../util/geo';

  const dispatch = createEventDispatcher();
  const projection = geoCylindricalEqualArea;
  const outline = geoGraticule().outline();
  const safety = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  export let height;
  export let items = []; // {key, value}
  export let key;
  export let keyToColor;
  export let geoMask;
  export let width;
  export let selectedKeys = [];

  $: height = Math.max(0, height - safety.top - safety.bottom);
  $: width = Math.max(0, width - safety.left - safety.right);
  $: geoMaskBbox = geoMask && geoGraticule().extent(geoMask).outline();
  $: getFeatures = createColoredFeatures(keyToColor, key);
  $: features = getFeatures(geojson);
  $: fitProjection = projection().fitSize([width, height], geojson);
  $: geopath = fitProjection && geoPath(fitProjection);
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

<g
  class="worldmap"
  transform="{`translate(${safety.left},${safety.top})`}"
>
  <path
    class="outline"
    d="{geopath(outline)}"
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
      on:mouseenter="{() => {dispatch('entered', feature.properties[key])}}"
      on:mouseleave="{() => {dispatch('exited', feature.properties[key])}}"
      stroke-dasharray="{feature.properties.color ? 'none' : '2 2'}"
    />
  </g>
  {/each}
  {#if geoMaskBbox}
  <path
    class="mask"
    fill-rule="nonzero"
    d="{geopath(geoMaskBbox)}"
  />
  {/if}
  {/if}
</g>

<style lang="less">
  .outline {
    fill-opacity: 0;
    stroke: none;
    cursor: pointer;
  }
  .feature {
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
  }
  .mask {
    fill-opacity: 0.05;
    /* fill: none; */
    stroke: black;
    stroke-width: 1.5;
    pointer-events: none;
  }
</style>
