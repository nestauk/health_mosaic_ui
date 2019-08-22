<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { toPx, makeStyle } from '@svizzle/dom';
  import * as _ from 'lamb';

  import { areValidBins } from '../../util/array';
  import { skipNull } from '../../util/object';
  import { HistogramDiv } from '../Histogram/';
  import { ForceCanvasDiv, LegendVolumeDegree } from '../Force/';
  import { pointerMargin } from './index';

  const dispatch = createEventDispatcher();

  export let colors;
  export let degreeAccessor;
  export let focusedNodeId;
  export let linkKeyToVolumeColor;
  export let linkVolumeBins = [];
  export let network;
  export let nodeDegreeBins = [];
  export let nodeKeyToVolumeColor;
  export let nodeVolumeBins = [];
  export let shouldResize;
  export let title;
  export let volumeAccessor;

  let bbox;
  let height = 0;
  let histogramWidth;
  let histogramHeight;
  let sensor;
  let target = null;
  let tooltip;
  let width = 0;

  const getSensorOrigin = () => {
    if (sensor) {
      bbox = sensor.getBoundingClientRect();
    }
  };

  onMount(getSensorOrigin);

  $: showLinkVolumeHistogram = areValidBins(linkVolumeBins)
  $: showDegreeHistogram = areValidBins(nodeDegreeBins);
  $: showNodeVolumeHistogram = areValidBins(nodeVolumeBins);
  $: $shouldResize && getSensorOrigin();

  const enteredNode = ({detail: {id, items}}) => {
    target = {id, items, count: items.length};
    dispatch('entered', {id});
  };
  const exitedNode = ({detail: {id}}) => {
    target = null;
    dispatch('exited', {id});
  };

  const mousemoved = event => {
    if (!target || !bbox) {
      tooltip = null;
      return;
    }

    const pointer = {
      x: event.clientX - bbox.x,
      y: event.clientY - bbox.y,
    };

    tooltip = {
      target,
      label: target.id,
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
      value: target.count,
    };
  };

  const mouseleft = event => {
    tooltip = null;
  }

  const nodeClick = () => {
    target && dispatch('nodeClick', {id: target.id});
  };

  // TODO
  // const clickedBin = ({detail: {ids, verb}}) => {
  //   consople.log('clickedBin', ids, verb);
  // }
</script>

<svelte:window on:resize={getSensorOrigin} />

<div class="container">
  {#if title}
  <header>
    <h3>{title}</h3>
  </header>
  {/if}
  <main>
    <div
      bind:clientWidth="{width}"
      bind:clientHeight="{height}"
      bind:this="{sensor}"
      class="board"
      on:mousemove="{mousemoved}"
    >
      <ForceCanvasDiv
        {focusedNodeId}
        {linkKeyToVolumeColor}
        {network}
        {nodeKeyToVolumeColor}
        on:entered="{enteredNode}"
        on:exited="{exitedNode}"
        on:click="{nodeClick}"
        on:mouseout="{mouseleft}"
        {shouldResize}
      />
      {#if showDegreeHistogram}
      <div class="widget histogram degree">
        <HistogramDiv
          bins="{nodeDegreeBins}"
          orientation_y="top-down"
          title="Connections"
          valueAccessor="{degreeAccessor}"
        />
      </div>
      {/if}
      {#if showNodeVolumeHistogram}
      <div class="widget histogram nodes volume">
        <HistogramDiv
          bins="{nodeVolumeBins}"
          title="Nodes volume"
          valueAccessor="{volumeAccessor}"
        />
      </div>
      {/if}
      {#if showLinkVolumeHistogram}
      <div class="widget histogram links volume">
        <HistogramDiv
          bins="{linkVolumeBins}"
          orientation_x="right-left"
          title="Links volume"
          valueAccessor="{volumeAccessor}"
        />
      </div>
      {/if}
      <div class="widget legend">
        <LegendVolumeDegree
          linecolor="grey"
          textcolor="black"
        />
      </div>
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
      user-select: none;

      .board {
        width: 100%;
        height: 100%;
        position: relative;

        .widget {
          height: 32%;
          width: 16%;
          position: absolute;
          pointer-events: none;
        }

        .histogram {
          &.degree {
            top: 10px;
            left: 10px;
          }

          &.volume {
            bottom: 10px;

            &.nodes {
              left: 10px;
            }
            &.links {
              right: 10px;
            }
          }
        }

        .legend {
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .tooltip {
          position: absolute;
          pointer-events: none;
          padding: 0.25em 0.5em;

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
</style>
