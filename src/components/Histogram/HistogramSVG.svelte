<script>
  import { createEventDispatcher } from 'svelte';
  import { extent } from 'd3-array';
  import { scaleLinear } from 'd3-scale';
  import * as _ from 'lamb';
  import { toggleItem } from '@svizzle/utils';

  import {
    getBinsItems,
    getBinsMax,
    makeBinsVisibleTicks
  } from '../../util/array';
  import { getKey } from '../../util/domain';
  import { roundTo } from '../../util/number';
  import { fontSizeFactor, maxfontSize, safety, textPadding } from './index';

  const dispatch = createEventDispatcher();
  const roundTo1 = roundTo(1);

  export let bins;
  export let colors;
  export let height;
  export let selectedKeys;
  export let valueAccessor;
  export let width;

  let selectedBins = [];
  $: if (!selectedKeys.length) {
    selectedBins = [];
  }

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
  $: bars = _.map(bins, (bin, index) =>
    _.setIn(bin, 'active',
      !selectedBins.length || selectedBins.includes(index)
    )
  );

  const clickedBin = index => () => {
    dispatch('clickedBin', {
      ids: _.map(bars[index].values, getKey),
      verb: !selectedBins.length
        ? 'add'
        : bars[index].active ? 'pull' : 'add'
    });
    selectedBins = toggleItem(selectedBins, index);
  }
</script>

<svelte:options namespace="svg" />

{#if scales}
<g class="histogram">
  <!-- <rect class="box" {width} {height} /> -->
  <g transform="translate({safety.left},{safety.top})">
    {#each bars as {active, range, values}, index}
    {#if values.length}
    <g
      class="bin"
      class:deselected="{!active}"
      transform="translate(0,{scales.y(range[0]) - barThickness})"
    >
      <rect
        class="sensor"
        width="{innerWidth}"
        height="{barThickness}"
        on:click="{clickedBin(index)}"
      />
      <rect
        class="bar"
        width="{scales.x(values.length)}"
        height="{barThickness}"
        fill="{colors[index]}"
      />
      <text
        class="binsize"
        x="{scales.x(values.length) + textPadding}"
        y="{barThickness / 2}"
        font-size="{fontSize}"
      >{values.length}</text>
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
    }
    text {
      stroke: none;
      dominant-baseline: middle;
      user-select: none;
      pointer-events: none;

      &.range {
        fill: black;
        text-anchor: end;
      }
    }
    .bin {
      pointer-events: none;
      .sensor {
        fill: grey;
        fill-opacity: 0;
        stroke: none;
        cursor: pointer;
        pointer-events: auto;

        &:hover {
          fill-opacity: 0.1;
        }
      }
      rect {
        stroke: grey;
      }
      text {
        fill: darkgray;
        text-anchor: start;
      }

      &.deselected {
        rect {
          stroke: lightgray;
          opacity: 0.5;
        }
        .sensor {
          stroke: none;
        }
      }
    }
    line {
      stroke: black;
    }
  }
</style>
