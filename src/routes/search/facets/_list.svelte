<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';
  import isEqual from 'just-compare';
  import { EyeIcon, EyeOffIcon } from 'svelte-feather-icons';
  import {
    objectToKeyValueArray,
    reduceFromObj,
    tapValue,
    toggleItem
  } from '@svizzle/utils';

  import BarchartV from '../../../components/BarchartV.svelte'
  import Fallback from '../../../components/Fallback.svelte'
  import { AddCircle, RemoveCircle } from '../../../components/Icons/'
  import { Results, Entity } from '../../../components/Results';
  import { NIH_type, CB_type, MU_type } from '../../../config';
  import { fieldToLabel, getName } from '../../../util/domain';
  import { makeAccAddAndCountWith } from '../../../util/function-function';
  import { getKey } from '../../../util/object.any';
  import { toLowerCase, toUpperCase } from '../../../util/string';
  import { SEARCH } from '../_layout.svelte';

  const {
    checkDirty,
    currentTabStore,
    listSortingStore,
    screenStore
  } = getContext(SEARCH);

  const makeShown = reduceFromObj((acc, path) => _.setPathIn(acc, path, true));

  // utils
  const getValueCount = _.getPath('value.count');
  const getLowercaseKey = _.pipe([getKey, toLowerCase]);
  const getLowercaseName = _.pipe([getName, toLowerCase]);
  const sortItemsByName = _.mapValuesWith(
    _.updatePath('items', _.sortWith([getLowercaseName]))
  );
  const isAscending = _.is('ascending');

  let changed;
  let paths = [];
  let previousSelectedItems;
  let showAll = false;

  $: isDirty = $screenStore && checkDirty();
  $: shown = makeShown(paths);

  /* selectedItems */

  $: selectedItems = $screenStore[$currentTabStore].selected || [];
  $: {
    changed = selectedItems && !isEqual(previousSelectedItems, selectedItems);
    if (changed) {
      previousSelectedItems = selectedItems;
    }
  }

  /* sort and group */

  $: by = $listSortingStore && $listSortingStore.by;
  $: direction = $listSortingStore &&  $listSortingStore.direction;
  $: isSortedAscending = isAscending(direction);

  $: getBy = _.getKey(by);
  $: getInitial = _.pipe([_.getKey(by), _.head, toUpperCase]);

  let keyAccessor;
  let groupSorting;
  $: switch (by) {
    case 'city':
    case 'continent':
    case 'country':
    // case 'state':
      keyAccessor = getBy;
      groupSorting = 'count';
      break;
    case 'name':
      keyAccessor = getInitial;
      groupSorting = 'alphanum';
      break;
    // case 'cost_ref':
    // case 'novelty':
    // case 'score':
    //   groupFn = _.groupBy(_.pipe([_.getKey(by), _.head]));
    //   break;
    // case 'start':
    //   groupFn = _.groupBy(_.pipe([_.getKey(by), _.head]));
    //   break;
    default:
      break;
  }

  // if we do't use by &&, having the same case won't change `keyAccessor`
  // hence `groupFn` won't change and the reduce will accumulate on the same object
  // which will grow in size indefintely
  $: groupFn = by && direction && _.pipe([
    reduceFromObj(makeAccAddAndCountWith(keyAccessor)),
    sortItemsByName
  ]);
  $: groupsObj = groupFn(selectedItems);

  // TODO use an array of criterias
  $: makeGroupsArray =
    _.pipe([
      objectToKeyValueArray,
      (groupSorting === 'count') && _.sortWith([
        isSortedAscending ? getValueCount : _.sorterDesc(getValueCount)
      ]) ||
      (groupSorting === 'alphanum') && _.sortWith([
        isSortedAscending ? getLowercaseKey : _.sorterDesc(getLowercaseKey)
      ])
    ]);
  $: groupsArray = makeGroupsArray(groupsObj);

  // group: anchor and Results each group
  $: useBarchart = [
    'city',
    'continent',
    'country',
    'name',  // initial
  ].includes(by);

  // histogram: anchor and Results each bin
  $: useHistogram = [
    'cost_ref',
    'novelty',
    'score',
    'start', // year
  ].includes(by);

  const toggle = path => () => {
    paths = toggleItem(paths, path)
  };
</script>

<div
  class="List"
  class:dirty="{isDirty}"
>
  {#if selectedItems.length}
  <header class="centeredflex">
    <div class="buttons">
      <span
        class="centeredflex"
        on:click={() => { showAll = true }}
      >
        <EyeIcon />
      </span>
      <span
        class="centeredflex"
        on:click={() => { showAll = false }}
      >
        <EyeOffIcon />
        </span>
      </div>
  </header>

  <main>
    <div class="col1">
      <Results dirty="{isDirty}" {changed}>
        {#each groupsArray as {key, value}, groupIndex}
          <div class="group">
            <header>
              <a href="#{key}">
                <span class="anchor">
                  #
                </span>
              </a>
              <span class="title">
                {key} ({groupsObj[key].count})
              </span>
            </header>
            {#each value.items as item, index}
              <Entity
                data={item}
                show={showAll || shown[groupIndex] && shown[groupIndex][index]}
                on:toggle={toggle(`${groupIndex}.${index}`)}
              ></Entity>
            {/each}
          </div>
        {/each}
      </Results>
    </div>
    <div class="col2">
      {#if useBarchart}
        <BarchartV
          items={groupsArray}
          resettableScroll={true}
          title="{fieldToLabel[by]} volume"
          valueAccessor={getValueCount}
        />
      {:else if useHistogram}
        <!-- <HistogramDiv
          bins="{nodeDegreeBins}"
          orientation_y="top-down"
          title="Connections"
          valueAccessor="{degreeAccessor}"
        /> -->
      {/if}
    </div>
  </main>
  {:else}
    <Fallback message="No results" />
  {/if}
</div>

<style lang="less">
  .List {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;

    --list-header-height: 40px;

    & > header {
      height: var(--list-header-height);
      padding: 0.5em;

      box-shadow: var(--shadow-header);

      .buttons {
        width: 66px;
        display: grid;
        height: 25px;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;

        span {
          opacity: 0.6;
          cursor: pointer;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    main {
      width: 100%;
      height: calc(100% - var(--list-header-height));

      display: grid;
      grid-template-columns: 1fr 250px;
      grid-template-rows: 100%;

      .col1 {
        grid-column: 1 / span 1;
      }
      .col2 {
        grid-column: 2 / span 1;
      }

      .group {
        margin-bottom: 3em;

        header {
          font-size: 1.5em;
          font-weight: bold;
          border-bottom: 1px solid lightgrey;
          padding-bottom: 0.25em;
          margin-bottom: 1em;

          a {
            text-decoration: none;
          }
          .anchor {
            color: lightgrey;
          }
          .title {
          }
        }
      }
    }

    &.dirty {
      /* use to disable events or so */
    }
  }
</style>
