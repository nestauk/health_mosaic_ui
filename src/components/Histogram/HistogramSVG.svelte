<script>
  import { createEventDispatcher } from 'svelte';
  import { scaleLinear, scaleLog } from 'd3-scale';
  import * as _ from 'lamb';
  import { toggleItem } from '@svizzle/utils';

  import {
    getBinsItems,
    getBinsMin,
    getBinsMax,
    makeBinsVisibleTicks,
  } from '../../util/array';
  import { getKey, getValues } from '../../util/object.any';
  import { roundTo1 } from '../../util/number';
  import { fontSizeFactor, maxfontSize, safety, textPadding } from './index';

  const dispatch = createEventDispatcher();

  export let bins;
  export let colors;
  export let height;
  export let orientation_x = 'left-right';
  export let orientation_y = 'bottom-up';
  export let selectedKeys = [];
  export let valueAccessor;
  export let width;

  $: isRightToLeft = orientation_x === 'right-left';
  $: isTopDown = orientation_y === 'top-down';

  let binsExtent = [];
  let selectedBins = [];
  $: if (!selectedKeys.length) {
    selectedBins = [];
  }

  $: innerWidth = Math.max(0, width - safety.left - safety.right);
  $: innerHeight = Math.max(0, height - safety.top - safety.bottom);
  $: barThickness = bins.length && (innerHeight / bins.length);
  $: fontSize = Math.min(maxfontSize, barThickness * fontSizeFactor);
  $: items = getBinsItems(bins);

  $: valuesMax = getBinsMax(bins);
  $: valuesMin = getBinsMin(bins);
  $: xScale =
    bins.length && (
    (Math.log10(Math.abs(valuesMax - valuesMin)) < 2)
      ? scaleLinear
      : scaleLog
    );
  $: binsExtent = bins.length
    ? [bins[0].range[0], _.last(bins).range[1]]
    : [];
  $: scales = bins.length && {
    x: xScale()
      .domain([1, valuesMax])
      .range([innerWidth / Math.log10(valuesMax), innerWidth]),
    y: scaleLinear().domain(binsExtent).range([0, innerHeight])
  };
  $: bars = _.map(bins, (bin, index) => {
    const {range, values} = bin;
    const active = !selectedBins.length || selectedBins.includes(index);
    const width = scales.x(values.length);
    const x = isRightToLeft ? innerWidth - width : 0;
    const y = isTopDown
      ? scales.y(range[0])
      : innerHeight - scales.y(range[0]) - barThickness;
    const labelX = isRightToLeft ? x - textPadding : width + textPadding;
    const labelAnchor = isRightToLeft ? 'end' : 'start';

    return _.merge(bin, {
      active,
      fill: bin.color || (colors ? colors[index] : 'none'),
      labelAnchor,
      labelX,
      stroke: (bin.color || colors) ? 'none' : 'black',
      width,
      x,
      y,
    })
  });
  $: origin = {
    x: isRightToLeft ? innerWidth : 0,
    y: isTopDown ? 0 : innerHeight
  }
  $: ticksX = isRightToLeft ? textPadding : -textPadding
  $: ticksAnchor = isRightToLeft ? 'start' : 'end';
  $: ticks = _.map(makeBinsVisibleTicks(bins), tick => ({
    tick: roundTo1(tick),
    y: isTopDown ? scales.y(tick) : -scales.y(tick)
  }));

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
    {#each bars as {
      active,
      fill,
      labelAnchor,
      labelX,
      width,
      x,
      y,
      stroke,
      values
    }, index}
    {#if values.length}
    <g
      class="bin"
      class:deselected="{!active}"
      transform="translate(0,{y})"
    >
      <rect
        class="sensor"
        width="{innerWidth}"
        height="{barThickness}"
        on:click="{clickedBin(index)}"
      />
      <rect
        class="bar"
        {width}
        height="{barThickness}"
        {x}
        {fill}
        {stroke}
      />
      <text
        class="binsize"
        x="{labelX}"
        y="{barThickness / 2}"
        font-size="{fontSize}"
        text-anchor="{labelAnchor}"
      >{values.length}</text>
    </g>
    {/if}
    {/each}
    <g
      class="axis"
      transform="translate({origin.x},{origin.y})"
    >
      <line y2={isTopDown ? innerHeight : -innerHeight}/>
      <circle r="2"/>
      {#each ticks as {tick, y}}
        <text
          class="range"
          x="{ticksX}"
          {y}
          font-size="{fontSize}"
          text-anchor="{ticksAnchor}"
        >{tick}</text>
      {/each}
    </g>
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
      }
    }
    circle {
      fill: black;
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
