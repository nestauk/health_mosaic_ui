<script>
  import { onMount } from 'svelte';
  import * as _ from 'lamb';
  import { toPx, makeStyle } from '@svizzle/dom';

  import { countries } from '../../../data/geo/iso_a2_to_name_by_type.json';
  import { exactAmountBins } from '../../util/array';
  import { skipNull } from '../../util/object';
  import { HistogramSVG } from '../Histogram';
  import { WorldMapSVG } from '../WorldMap';
  import { histogramMargin, pointerMargin } from './index';

  export let colors;
  export let keyAccessor;
  export let items = [];
  export let title;
  export let valueAccessor;

  let bbox;
  let width = 0;
  let height = 0;
  let pointer;
  let svg;
  let target;
  let tooltip;

  $: itemsByKey = _.index(items, keyAccessor);
  $: histogramWidth = Math.min(300, width / 5);
  $: histogramHeight = Math.min(300, height / 3);
  $: bins = exactAmountBins(items, colors.length, valueAccessor);
  $: keyToColor = _.reduce(
    _.zip(colors, bins),
    (obj, [color, {range, values}]) => {
      values.forEach(({key}) => {
        obj[key] = color;
      })
      return obj;
    },
    {}
  ); // TODO investigate a util
  $: histogramOrigin = {
    x: histogramMargin,
    y: height - histogramHeight - histogramMargin
  };

  const onTarget = ({detail: key}) => {
    target = key;
  };
  const offTarget = () => {
    target = null;
  };

  const getSvgOrigin = () => {
    bbox = svg.getBoundingClientRect();
  };

  onMount(getSvgOrigin);

  const moved = event => {
    if (!target || !bbox) {
      tooltip = null;
      return;
    }

    pointer = {
      x: event.clientX - bbox.x,
      y: event.clientY - bbox.y,
    };

    tooltip = {
      target,
      label: countries[target],
      style: makeStyle(skipNull({
        top: pointer.y <= height / 2
          ? toPx(pointer.y + pointerMargin)
          : null,
        right: pointer.x > width / 2
          ? toPx(width - pointer.x + pointerMargin)
          : null,
        bottom: pointer.y > height / 2
          ? toPx(height - pointer.y + pointerMargin)
          : null,
        left: pointer.x <= width / 2
          ? toPx(pointer.x + pointerMargin)
          : null,
      })),
      value: itemsByKey[target] && itemsByKey[target].value
    };
  };
</script>

<svelte:window on:resize={getSvgOrigin} />

<div class="container">
  {#if title}
  <header>
    <h3>{title}</h3>
  </header>
  {/if}
  <main>
    <div
      class="board"
      bind:clientWidth="{width}"
      bind:clientHeight="{height}"
    >
      <svg
        bind:this="{svg}"
        {width}
        {height}
        on:mousemove="{moved}"
      >
        <WorldMapSVG
          {height}
          {items}
          key="iso_a2"
          {keyToColor}
          on:enter={onTarget}
          on:exit={offTarget}
          {valueAccessor}
          {width}
        />
        <g transform="translate({histogramOrigin.x},{histogramOrigin.y})">
          <HistogramSVG
            height="{histogramHeight}"
            {bins}
            {colors}
            {valueAccessor}
            width="{histogramWidth}"
          />
        </g>
      </svg>
      {#if tooltip}
      <div
        class="tooltip"
        style="{tooltip.style}"
      >
        <span>{tooltip.label}</span>
        {#if tooltip.value}
        <span>{tooltip.value}</span>
        {/if}
      </div>
      {/if}
    </div>
  </main>
</div>

<style lang="less">
  .container {
    width: 100%;
    height: 100%;
    padding: 10px;

    @header-height: 2em;

    header {
      width: 100%;
      height: @header-height;

      display: flex;
      align-items: center;
    }

    main {
      width: 100%;
      height: calc(100% - @header-height);
      padding: 10px;

      .board {
        width: 100%;
        height: 100%;
        position: relative;

        svg {
          width: 100%;
          height: 100%;
        }

        .tooltip {
          position: absolute;
          padding: 0.25em 0.5em;
          background-color: rgba(15,15,15,0.7);
          color: lightgrey;
          pointer-events: none;

          span:nth-child(1) {
            font-weight: bold;
          }
          span:nth-child(3) {
            font-style: italic;
          }
        }
      }
    }
  }
</style>
