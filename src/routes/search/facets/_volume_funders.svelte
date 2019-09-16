<script>
  // FIXME difference color schemes for each facet type (map, network, ...)
  import { getContext } from 'svelte';
  import { extent } from 'd3-array';
  import { schemeSet3 } from 'd3-scale-chromatic';
  import isEqual from 'just-compare';
  import * as _ from 'lamb';
  import { toggleItem } from '@svizzle/utils';

  import BarchartV from '../../../components/BarchartV.svelte';
  import Fallback from '../../../components/Fallback.svelte';
  import { ForceWithDistributionsDiv } from '../../../components/ForceWithDistributions/';
  import Switch from '../../../components/Switch.svelte';

  import { screenStore, currentTab } from '../../../stores/search.ts';
  import {
    exactAmountBins,
    sortValueDescKeyAsc,
    trimBins
  } from '../../../util/array';
  import { noneLabel } from '../../../util/domain';
  import {
    getNodeDegree,
    makeEmptyNetwork,
    makeFilterUndirectedNetwork,
    makeLinksVolume,
    makeNodesDegrees,
    makeNodesVolume,
    getVolume,
    makeUndirectedNetworkWith,
  } from '../../../util/network';
  import { objectToValuesCountArray } from '../../../util/object';
  import { SEARCH } from '../_layout.svelte';

  const { select } = getContext(SEARCH);

  const heroKey = 'funders'; // FIXME pass the key as prop to make it generic
  const ignoredKey = 'ignoredFunders'; // FIXME pass the key as prop to make it generic
  const accessor = _.pipe([
    _.getKey(heroKey),
    _.when(_.isNil, _.always([noneLabel])),
  ]);
  const makeNetwork = makeUndirectedNetworkWith(accessor);
  const filterNetwork = makeFilterUndirectedNetwork();
  const makeFilteredNetwork = _.pipe([makeNetwork, filterNetwork]);

  const colors = schemeSet3;

  export let isDirty;
  export let shouldResize;

  let focusedNodeId = null;
  let linkKeyToVolumeColor;
  let linkVolumeBins;
  let linksVolume;
  let network = makeEmptyNetwork();
  let nodesDegree;
  let nodeKeyToVolumeColor;
  let nodesVolume;
  let nodeVolumeBins;

  $: selections = $screenStore[$currentTab].selections;

  // FIXME we're manually managing the network update
  // to avoid updating whenever the global store changes

  let previousSelectedItems;
  let selectedItems;
  $: {
    const _selectedItems = $screenStore[$currentTab].selected;
    if (!isEqual(previousSelectedItems, _selectedItems)) {
      selectedItems = _selectedItems;
      previousSelectedItems = _selectedItems;
    }
  }

  let previousSkippedNodeIds;
  let skippedNodeIds;
  $: {
    const _skippedNodeIds = (selections[ignoredKey] && selections[ignoredKey].value) || [];
    if (!isEqual(previousSkippedNodeIds, _skippedNodeIds)) {
      skippedNodeIds = _skippedNodeIds;
      previousSkippedNodeIds = _skippedNodeIds;
    }
  }

  let previousExcludedTerms;
  let excludedTerms;
  $: {
    const _excludedTerms = (selections[heroKey] && selections[heroKey].value) || [];
    if (!isEqual(previousExcludedTerms, _excludedTerms)) {
      excludedTerms = _excludedTerms;
      previousExcludedTerms = _excludedTerms;
    }
  }

  // end of FIXME

  $: {
    if (selectedItems) {
      network = makeFilteredNetwork(selectedItems);
      nodesDegree = makeNodesDegrees(network);
      nodesVolume = makeNodesVolume(network);
      linksVolume = makeLinksVolume(network);
      previousSelectedItems = selectedItems;
    }
  }

  $: subNetwork = {
    nodes: _.skip(network.nodes, skippedNodeIds),
    links: _.fromPairs(
      _.filter(_.pairs(network.links), ([id, link]) =>
        !skippedNodeIds.includes(link.nodes[0]) &&
        !skippedNodeIds.includes(link.nodes[1])
      )
    )
  };
  // $: subNodesDegree = makeNodesDegrees(subNetwork);
  $: subNodesVolume = makeNodesVolume(subNetwork);
  $: subLinksVolume = makeLinksVolume(subNetwork);

  $: linksArray = _.values(network.links);
  $: nodesArray = _.values(network.nodes);
  $: volumeInterval = extent(linksArray.concat(nodesArray), getVolume);

  $: {
    // TODO svizzle
    const {bins, start, end} = trimBins(
      exactAmountBins({
        array: linksArray,
        size: colors.length,
        interval: volumeInterval,
        accessor: getVolume
      })
    );
    const linkVolumeColors = _.slice(colors, start, end + 1);
    const colorBinPairs = _.zip(bins, linkVolumeColors);
    linkVolumeBins = _.map(
      colorBinPairs,
      ([bin, color]) => ({...bin, color})
    );

    linkKeyToVolumeColor = _.reduce(
      colorBinPairs,
      (obj, [{values}, color]) => {
        values.forEach(({id: key}) => {
          obj[key] = color;
        })
        return obj;
      },
      {}
    );
  };

  $: {
    const {bins, start, end} = trimBins(
      exactAmountBins({
        array: nodesArray,
        size: colors.length,
        interval: volumeInterval,
        accessor: getVolume
      })
    );
    const nodeVolumeColors = _.slice(colors, start, end + 1);
    const colorBinPairs = _.zip(bins, nodeVolumeColors);
    nodeVolumeBins = _.map(
      colorBinPairs,
      ([bin, color]) => ({...bin, color})
    );
    nodeKeyToVolumeColor = _.reduce(
      colorBinPairs,
      (obj, [{values}, color]) => {
        values.forEach(({id: key}) => {
          obj[key] = color;
        })
        return obj;
      },
      {}
    ); // TODO util?
  };

  $: nodeDegreeBins = trimBins(
    exactAmountBins({
      array: nodesArray,
      size: 10,
      accessor: getNodeDegree
    })
  ).bins;

  const nodeEntered = ({detail: {id}}) => {
    focusedNodeId = id;
  };
  const nodeExited = ({detail: {id}}) => {
    focusedNodeId = null;
  };

  let clickTask = 'ignore';
  const toggleClickTask = ({detail: value}) => {
    clickTask = value;
  };

  const nodeClicked = ({detail: {id}}) => {
    clickTask === 'ignore'
      ? select({
        key: ignoredKey,
        type: 'ignore',
        value: toggleItem(skippedNodeIds, id)
      }, $currentTab)
      : select({
        key: heroKey,
        type: 'exclude',
        value: toggleItem(excludedTerms, id !== noneLabel ? id : null)
      }, $currentTab)
  };
</script>

<div
  class="VolumeFunders"
  class:dirty="{isDirty}"
>
  {#if selectedItems.length}
  <div class="col col1">
    <BarchartV
      focusedKey="{focusedNodeId}"
      interactive="{true}"
      items="{subNodesVolume}"
      keyToColor="{nodeKeyToVolumeColor}"
      on:clicked="{nodeClicked}"
      on:entered="{nodeEntered}"
      on:exited="{nodeExited}"
      title="Nodes volume"
    />
  </div>
  <div class="col col2">
    <header>
      <span class="title">Network</span>
      <div class="control">
        <Switch
          current="{'ignore'}"
          on:toggle="{toggleClickTask}"
          values="{['ignore', 'exclude']}"
        />
      </div>
    </header>
    <ForceWithDistributionsDiv
      colors={schemeSet3}
      degreeAccessor="{getNodeDegree}"
      {focusedNodeId}
      {linkKeyToVolumeColor}
      {linkVolumeBins}
      network={subNetwork}
      {nodeDegreeBins}
      {nodeKeyToVolumeColor}
      {nodeVolumeBins}
      on:nodeClick="{nodeClicked}"
      on:entered="{nodeEntered}"
      on:exited="{nodeExited}"
      {shouldResize}
      volumeAccessor="{getVolume}"
    />
    <!-- title="Network" -->
  </div>
  <div class="col col3">
    <BarchartV
      items="{subLinksVolume}"
      keyToColor="{linkKeyToVolumeColor}"
      title="Links volume"
    />
  </div>
  {:else}
  <div class="col fullwidth">
    <Fallback message="No results" />
  </div>
  {/if}
</div>

<style lang="less">
  .VolumeFunders {
    height: 100%;
    width: 100%;
    padding: var(--size-global-padding);

    flex: 1;
    height: 100%;
    max-height: 100%;

    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 100%;

    .col {
      height: 100%;
      max-height: 100%;

      header {
        height: 2em;
        display: flex;
        align-items: center;
        /* justify-content: flex-end; */
        justify-content: space-between;
        padding: 0 10px;

        span {
          font-size: 1.17em; /* FIXME use vars, this is same as an h3 */
        }

        .control {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      &.col1 {
        grid-column: 1 / span 2;
      }
      &.col2 {
        grid-column: 3 / span 7;
      }
      &.col3 {
        grid-column: 10 / span 3;
      }
      &.fullwidth {
        grid-column: 1 / span 12;
      }
    }

    &.dirty {
      /* use to disable events or so */
    }
  }
</style>
