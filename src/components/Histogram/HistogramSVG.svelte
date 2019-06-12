<script>
  import { extent } from 'd3-array';
  import { scaleLinear } from 'd3-scale';
  import * as _ from 'lamb';

  import {
    getBinsItems,
    getBinsMax,
    makeBinsVisibleTicks
  } from '../../util/array';
  import { roundTo } from '../../util/number';
  import { fontSizeFactor, maxfontSize, safety, textPadding } from './index';

  const roundTo1 = roundTo(1);

  export let valueAccessor;
  export let bins;
  export let colors;
  export let height;
  export let width;

  $: innerWidth = Math.max(0, width - safety.left - safety.right);
  $: innerHeight = Math.max(0, height - safety.top - safety.bottom);
  $: binsMax = getBinsMax(bins);
  $: ticks = makeBinsVisibleTicks(bins);
  $: items = getBinsItems(bins);
  $: itemsExtent = extent(items, valueAccessor);
  $: barThickness = innerHeight / bins.length;
  $: fontSize = Math.max(maxfontSize, barThickness * fontSizeFactor);
  $: scales = {
    x: scaleLinear().domain([0, binsMax]).range([0, innerWidth]),
    y: scaleLinear().domain(itemsExtent).range([innerHeight, 0])
  };
</script>

<svelte:options namespace="svg" />

{#if scales}
<g class="histogram">
  <!-- <rect class="box" {width} {height} /> -->
  <g transform="translate({safety.left},{safety.top})">
    {#each bins as {range, values}, index}
    {#if values.length}
    <g
      class="bin"
      transform="translate(0,{scales.y(range[0]) - barThickness})"
    >
      <rect
        width="{scales.x(values.length)}"
        height="{barThickness}"
        fill="{colors[index]}"
      />
      <text
        class="binsize"
        x="{scales.x(values.length) + textPadding}"
        y="{barThickness / 2}"
        font-size="{fontSize}"
      >({values.length})</text>
    </g>
    {/if}
    {/each}
    <line y2={innerHeight} />
    {#each ticks as tick}
      <text
        class="range"
        x="{-textPadding}"
        y="{scales.y(tick)}"
        font-size="{fontSize}"
      >{roundTo1(tick)}</text>
    {/each}
  </g>
</g>
{/if}

<style lang="less">
  .histogram {
    rect, line {
      stroke-width: 0.5px;
      shape-rendering: crispEdges;
    }
    rect.box {
      fill: white;
      fill-opacity: 0.75;
      /* stroke: darkgrey; */
    }
    text {
      stroke: none;
      dominant-baseline: middle;

      &.range {
        fill: black;
        text-anchor: end;
      }
    }
    .bin {
      rect {
        stroke: lightgrey;
      }
      text {
        fill: darkgray;
        text-anchor: start;
      }
    }
    line {
      stroke: black;
    }
  }
</style>
