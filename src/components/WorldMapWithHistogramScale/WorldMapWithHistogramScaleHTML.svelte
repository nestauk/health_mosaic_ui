<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { extent } from 'd3-array';
  import * as _ from 'lamb';
  import { toPx, makeStyle } from '@svizzle/dom';
  import { toggleItem } from '@svizzle/utils';

  import { countries } from '../../../data/geo/iso_a2_to_name_by_type.json';
  import { areValidBins, exactAmountBins } from '../../util/array';
  import { skipNull } from '../../util/object';
  import { HistogramSVG } from '../Histogram';
  import { WorldMapSVG } from '../WorldMap';
  import {
    histogramMargin,
    histogramMaxHeight,
    histogramMaxWidth,
    pointerMargin
  } from './index';

  const dispatch = createEventDispatcher();

  export let colors;
  export let keyAccessor;
  export let items = [];
  export let title;
  export let valueAccessor;
  export let selectedKeys = [];

  let bins;
  let bbox;
  let height = 0;
  let keyToColor;
  let pointer;
  let svg;
  let target;
  let tooltip;
  let width = 0;

  $: itemsByKey = _.index(items, keyAccessor);
  $: histogramWidth = Math.min(histogramMaxWidth, width / 5);
  $: histogramHeight = Math.min(histogramMaxHeight, height / 3);

  $: itemsExtent = extent(items, valueAccessor);
  $: bins = exactAmountBins({
    array: items,
    size: colors.length,
    interval: itemsExtent,
    accessor: valueAccessor
  });
  $: showHistogram = areValidBins(bins);
  $: keyToColor = showHistogram
    ? _.reduce(
      _.zip(colors, bins),
      (obj, [color, {range, values}]) => {
        values.forEach(({key}) => {
          obj[key] = color;
        })
        return obj;
      },
      {}
    ) // TODO investigate a svizzle util
    : _.mapValues(itemsByKey, x => colors[0]);

  $: histogramOrigin = {
    x: histogramMargin,
    y: height - histogramHeight - histogramMargin
  };

  const enteredNode = ({detail: key}) => {
    target = key;
  };
  const exitedNode = () => {
    target = null;
  };
  const toggleTarget = ({detail: id}) =>
    dispatch('selected', {
      key: 'country_id', // TODO pass the key as prop to make it generic
      type: 'include',
      value: toggleItem(selectedKeys, id)
    });

  const clickedBin = ({detail: {ids, verb}}) =>
    dispatch('selected', {
      key: 'country_id', // TODO pass the key as prop to make it generic
      type: 'include',
      value: verb === 'add'
        ? selectedKeys.concat(ids)
        : _.pullFrom(selectedKeys, ids)
    });

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

    const hasData = _.has(itemsByKey, target);

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
      value: hasData && itemsByKey[target].value,
      hasData
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
          on:entered="{enteredNode}"
          on:exited="{exitedNode}"
          on:clickTarget="{toggleTarget}"
          on:deselectAll
          {selectedKeys}
          {valueAccessor}
          {width}
        />
        {#if showHistogram}
        <g transform="translate({histogramOrigin.x},{histogramOrigin.y})">
          <HistogramSVG
            {bins}
            {colors}
            height="{histogramHeight}"
            interactive="true"
            {selectedKeys}
            {valueAccessor}
            width="{histogramWidth}"
            on:clickedBin="{clickedBin}"
          />
        </g>
        {/if}
      </svg>
      {#if tooltip}
      <div
        class="tooltip"
        class:active="{tooltip.hasData}"
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
      user-select: none;

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
          pointer-events: none;

          background-color: rgba(255,255,255,0.75);
          border: 1px solid #888;
          color: #555;
          font-weight: light;
          font-size: 0.8em;

          &.active {
            background-color: rgba(15,15,15,0.7);
            color: lightgrey;
            font-size: 1em;

            span:nth-child(1) {
              font-weight: bold;
            }
            span:nth-child(2) {
              font-style: italic;
            }
          }
        }
      }
    }
  }
</style>
