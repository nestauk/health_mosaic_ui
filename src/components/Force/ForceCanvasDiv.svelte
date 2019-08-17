<script>
  import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
  import * as _ from 'lamb';
  import {
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceRadial,
    forceSimulation,
  } from 'd3-force';
  import { extent } from 'd3-array';
  import { color as d3Color } from 'd3-color';
  import { scaleLinear, scalePow } from 'd3-scale';
  import { makeLinkVector, vectorLength2D } from '@svizzle/geometry';
  import { getObjSize } from '@svizzle/utils';

  // FIXME to make this component generic,
  // we're probably better to pass these functions as props or from context
  import { makeIndexByID } from '../../util/domain';
  import {
    getLinkId,
    getNodeDegree,
    getNodesSortedDescByVolume,
    getVolume,
    removeDisconnectedNodes
  } from '../../util/network';
  import { getId } from '../../util/object.string';

  const dispatch = createEventDispatcher();

  const focusedNodeFill = 'white';
  const focusedNodeLineWidth = 2;
  const focusedNodeStroke = 'black';
  const fontSizeMin = 16;
  const fontFamily = 'sans-serif';
  const fontStyle = `${fontSizeMin}px ${fontFamily}`;
  const maxAmountOfLabels = 20;
  const minNodeRadius = 2;
  const maxNodeRadius = 20;
  const nodeLineWidth = 0.5;
  const nodeStrokeColor = 'black';

  export let focusedNodeId = null;
  export let linkKeyToVolumeColor;
  export let network;
  export let nodeKeyToVolumeColor;
  export let shouldResize;

  let bbox;
  let canvas;
  let container;
  let context;
  let focusedNodeIdChanged;
  let frame;
  let height = 0;
  let hoveredNodeLabel;
  let mousePos = null;
  let nodeLabelMargin = 5;
  let nodes = [];
  let previousNodesIndex = {};
  let width = 0;

  const getSensorOrigin = () => {
    if (canvas) {
      bbox = canvas.getBoundingClientRect();
    }
  };

  onMount(() => {
    context = canvas.getContext('2d');
    context.font = fontStyle;
    getSensorOrigin();
  });

  // FIXME to avoid:
  // `Failed to build — error in ...: Cyclical dependency detected`
  afterUpdate(() => {
    if (frame === 0) {
      previousNodesIndex = makeIndexByID(nodes);
    };
  });

  $: $shouldResize && getSensorOrigin();
  $: viewCenter = {x: width / 2, y: height / 2};
  $: maxRadius = Math.min(viewCenter.x, viewCenter.y);
  $: sortedNodes = getNodesSortedDescByVolume(network);
  $: sortedConnectedNodes = removeDisconnectedNodes(sortedNodes);
  $: nodeDegreeExtent = extent(sortedNodes, getNodeDegree);

  // FIXME would be more efficient to just take first and last and sort them
  // (sortedNodes is sorted but we don't want to depend on knowing its order)
  $: connectedNodeVolumeExtent = extent(sortedConnectedNodes, getVolume);
  $: nodeVolumeExtent = extent(sortedNodes, getVolume);
  $: radiusScale =
    scalePow()
    .exponent(0.5)
    .domain(connectedNodeVolumeExtent)
    .range([minNodeRadius, maxNodeRadius])
  $: getRadius = _.pipe([getVolume, radiusScale]);
  $: connectedNodesRadiusExtent = connectedNodeVolumeExtent.map(radiusScale);
  $: nodes = _.map(sortedNodes, (node, index) => {
    const fillColor = nodeKeyToVolumeColor[node.id];
    const radius = getRadius(node);
    const showLabel = index <= maxAmountOfLabels;

    // signals that we should recalc the nodes index
    frame = 0;

    if (!_.has(previousNodesIndex, node.id)) {
      return _.merge(node, {
        fillColor,
        showLabel,
        radius,
        strokeColor: nodeStrokeColor
      });
    }

    const {fx, fy, vx, vy, x, y} = previousNodesIndex[node.id];
    return _.merge(node, {
      fillColor,
      fx,
      fy,
      showLabel,
      radius,
      strokeColor: nodeStrokeColor,
      vx,
      vy,
      x,
      y
    });
  });

  $: ringRadiusScale =
    scaleLinear()
    .domain(nodeDegreeExtent)
    .range([maxRadius - maxNodeRadius, 0])
  $: getRingRadius = _.pipe([getNodeDegree, ringRadiusScale]);

  // links
  $: linksArray = _.values(network.links);
  $: linkVolumeExtent = extent(linksArray, getVolume);
  $: isLinkVolumeSingleValue = linkVolumeExtent[0] === linkVolumeExtent[1];
  $: linkWidthScale =
    isLinkVolumeSingleValue
      ? _.always(connectedNodesRadiusExtent[0])
      : scaleLinear()
      .domain(linkVolumeExtent)
      .range(connectedNodesRadiusExtent);
  $: linkWidth = _.pipe([getVolume, linkWidthScale]);
  $: linkStrengthScale =
    isLinkVolumeSingleValue
      ? _.always(0.25)
      : scaleLinear()
        .domain(linkVolumeExtent)
        .range([0.05, 0.75]);
  $: linkStrength = _.pipe([getVolume, linkStrengthScale]);
  $: linkOpacityScale =
    isLinkVolumeSingleValue
      ? _.always(0.8)
      : scaleLinear()
        .domain(linkVolumeExtent)
        .range([0.2, 0.8]);
  $: linkOpacity = _.pipe([getVolume, linkOpacityScale]);
  $: links = _.map(linksArray, link => {
    const color = d3Color(linkKeyToVolumeColor[link.id]);
    color.opacity = linkOpacity(link);

    return _.merge(link, {
      color,
      source: link.nodes[0],
      target: link.nodes[1],
    });
  });

  const getNodeRadius = _.getKey('radius');
  const collision = forceCollide().radius(getNodeRadius);

  $: simulation = getObjSize(nodes) &&
    forceSimulation(nodes)
    .velocityDecay(0.85)
    .alphaMin(1e-2)
    .alpha(0.7)
    .force('link',
      forceLink(links)
      .id(getId)
      .strength(linkStrength)
    )
    .force('charge',
      forceManyBody()
      .strength(-80)
    )
    .force('center', forceCenter(viewCenter.x, viewCenter.y))
    .force('rings',
      forceRadial()
      .x(viewCenter.x)
      .y(viewCenter.y)
      .radius(getRingRadius)
      .strength(1)
    )
    .force('collision', collision)
    .on('tick', () => {
      frame += 1;
    });

  $: nodesLayout = (frame > 0) && _.map(nodes, node => {
    const path = new Path2D();
    path.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

    return _.merge(node, {path});
  });
  $: nodesLayoutIndex = nodesLayout && makeIndexByID(nodesLayout);

  // FIXME temp, TODO add option `ignoreRadius` to svizzle's makeLinkVector
  const skipRadius = _.skipKeys(['radius']);
  $: linksLayout = links && nodesLayoutIndex && _.map(links, link => {
    const linkVector = makeLinkVector({
      source: skipRadius(nodesLayoutIndex[link.source.id]),
      target: skipRadius(nodesLayoutIndex[link.target.id]),
    });

    return _.merge(link, linkVector);
  });

  /* all set up, draw */
  $: frame && drawCanvas();
  $: focusedNodeIdChanged && drawCanvas();

  /* interaction */

  const mousemoved = event => {
    if (!bbox) {
      mousePos = null;
      return;
    }

    mousePos = {
      x: event.clientX - bbox.x,
      y: event.clientY - bbox.y,
    };
  };

  $: {
    if (context && mousePos && simulation) {
      const {x, y} = mousePos;
      const node = simulation.find(x, y, 1.2 * maxNodeRadius);

      const nextFocusedNodeId =
        node
        && _.has(nodesLayoutIndex, node.id)
        && context.isPointInPath(nodesLayoutIndex[node.id].path, x, y)
        && node.id
        || null;

      if (!nextFocusedNodeId && focusedNodeId) {
        dispatch('exited', {id: focusedNodeId});
      }
      focusedNodeIdChanged = nextFocusedNodeId !== focusedNodeId;
      focusedNodeId = nextFocusedNodeId || null;
    }
  }

  $: {
    if (nodesLayoutIndex && focusedNodeId && nodesLayoutIndex[focusedNodeId]) {
      const {id, items} = nodesLayoutIndex[focusedNodeId];
      dispatch('entered', {id, items});
    }
  }

  /* DRAW */

  const cleanCanvas = () => {
    if (width && context) {
      context.save();
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
      context.restore();
    }
  };

  const drawAllLinks = () => {
    if (context && linksLayout) {
      context.save();

      linksLayout.forEach(link => {
        context.strokeStyle = link.color;
        context.lineWidth = linkWidth(link);

        context.beginPath();
        context.moveTo(link.x1, link.y1);
        context.lineTo(link.x2, link.y2);
        context.stroke();
      });

      context.restore();
    }
  };

  const drawNodes = () => {
    if (context && nodesLayout) {
      context.save();

      nodesLayout.forEach(node => {
        const isFocusedNode = node.id === focusedNodeId;

        context.fillStyle =
          isFocusedNode ? focusedNodeFill : node.fillColor;
        context.fill(node.path);

        context.lineWidth =
          isFocusedNode ? focusedNodeLineWidth : nodeLineWidth;
        context.strokeStyle =
          isFocusedNode ? focusedNodeStroke : node.strokeColor;
        context.stroke(node.path);
      });

      context.restore();
    }
  };

  const drawNodesLabels = () => {
    if (context && nodesLayout) {
      context.save();
      context.textBaseline = 'middle';
      context.textAlign = 'center';

      nodesLayout.forEach(node => {
        if (node.showLabel) {
          context.fillStyle = 'black';
          context.font = fontStyle;
          // context.font = node.fontStyle;
          context.fillText(
            node.label,
            node.x,
            node.y + 5 + node.radius + fontSizeMin / 2
          );
        }
      });

      context.restore();
    }
  };

  const drawCanvas = () => {
    cleanCanvas();
    drawAllLinks();
    drawNodes();
    drawNodesLabels();
  };
</script>

<svelte:window on:resize={getSensorOrigin} />

<div
  bind:clientWidth="{width}"
  bind:clientHeight="{height}"
  class="container"
  on:mouseout
>
  <canvas
    bind:this="{canvas}"
    {height}
    style="cursor: {focusedNodeId ? 'pointer' : 'auto'}"
    {width}
    on:mousemove="{mousemoved}"
    on:click
  >
    Unfortunately your browser doesn't support canvas (FIXME better copy)
  </canvas>
</div>

<style lang="less">
  .container {
    width: 100%;
    height: 100%;

    canvas {
      width: 100%;
      height: 100%;
      user-select: none;
    }
  }
</style>
