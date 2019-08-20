<script context="module">
  export const SEARCH = {};
</script>

<script>
  import { stores } from '@sapper/app';
  import { onMount, onDestroy, setContext } from 'svelte';
  import { isIterableEmpty, isObjNotEmpty } from '@svizzle/utils';

  import Nav from '../../components/Nav.svelte';
  import Sidebar from '../../components/Sidebar.svelte';
  import RouterLink from '../../components/RouterLink.svelte';
  import { project_title, searchRouteName } from '../../config.js';
  import { screenMachine } from '../../services/screen_service.ts';
  import {
    screenStore,
    idStore,
    currentTab,
  } from '../../stores/search.ts';
  import { shouldResizeStore } from '../../stores/';

  const { page } = stores();

  onMount(() => {
    if($page.query && $page.query.q) {
      searchMachine.send('QUERY_ENTERED')
      searchMachine.send({ type:'SEARCHED', tabId: $currentTab });
    }
  })

  onDestroy(() => {
    screenMachine.send('STORE_RESET');
  })

  screenMachine.send({
    type: 'TAB_CREATED',
    tabId: $idStore,
    route: $page.path,
    queryParams: $page.query && $page.query.q,
    selectionParams: $page.query && $page.query.s,
    ESIndex: $page.query && $page.query.i,
    ESLogic: $page.query && $page.query.o,
    isPageInit: true
  });

  const transitionended = () => {
    shouldResizeStore.set(true);
  }
  const transitionstarted = () => {
    shouldResizeStore.set(false);
  }

  setContext(SEARCH, {
    transitionComplete:
      () => screenMachine.send({ type: 'ROUTE_CHANGE_COMPLETED' }),
    data: screenStore,
    checkDirty: () =>
      searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty'),
    select: (selection, tabId) =>
      screenMachine.send({
        type: 'SELECTION_UPDATED',
        tabId,
        selection,
        route: $page.path
      }),
    shouldResize: shouldResizeStore
  });

  $: uiQuery = $screenStore[$currentTab].uiQuery;
  $: hasNoQuery = isIterableEmpty(uiQuery[0].terms[0].term);
  $: withSelections = isObjNotEmpty($screenStore[$currentTab].selections);
  $: visible = $screenStore[$currentTab].visible;
  $: searchMachine = $screenMachine.context.searchMachines[$currentTab];
  $: isLoading = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Pending');
  $: isError = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Error');
  $: tabs = Object.entries($screenStore);

  const sendTabCreated = () =>  screenMachine.send({
    type: 'TAB_CREATED',
    tabId: $idStore,
    route: $page.path,
  });

  const sendTab = (type, id) =>  screenMachine.send({
    type,
    tabId: parseInt(id, 10),
    route: $page.path,
    queryParams: $page.query && $page.query.q,
    ESIndex: $page.query && $page.query.i
  });

  const sendTabRenamed = ({detail: { value, id }}) =>
    screenMachine.send({type: 'TAB_RENAMED', labelText: value , id: parseInt(id, 10)});

  const sendRouteChanged = (route) =>
    screenMachine.send({
      type: 'ROUTE_CHANGED',
      route: `/${searchRouteName}/${route}`
    })

  /* facets */

  const facetTabs = [
    {id: '', label: 'List'},
    {id: 'volume_geo', label: 'Volume by Country'},
    {id: 'map_geo', label: 'Locations'},
    {id: 'volume_terms', label: 'Volume by Term'},
    {id: 'volume_countries', label: 'Volume by Mentioned Countries'},
    {id: 'volume_funders', label: 'Volume by Funder'},
  ];

  const onFacetTabClick = id => () => {
    sendRouteChanged(id);
  }

  const renderTitle = (query = '', type = '') => {
    let typeTitle;
    if (!type) {
      typeTitle = '';
    } else {
      typeTitle = type.charAt(0).toUpperCase() + type.substring(1);
    }

    return query ? `- ${typeTitle} ${query}` : '';
  }

  $: selectedFacet = $page.params.facet || '';
  $: queryTitle = renderTitle($page.query.q, $page.query.i);
</script>

<svelte:head>
  <title>{project_title} {queryTitle}</title>
</svelte:head>

<!-- <Nav
  {isLoading}
  {isError}
  {tabs}
  activeTab="{$currentTab}"
  on:newtab="{sendTabCreated}"
  on:changetab="{({detail}) => sendTab('TAB_SELECTED', detail)}"
  on:deletetab="{({detail}) => sendTab('TAB_DELETED', detail)}"
  on:textchange={sendTabRenamed}
/> -->

<Sidebar />

<div
  class="facets"
  class:noQuery="{hasNoQuery}"
  class:foldedWithNoSelections="{!hasNoQuery && !visible && !withSelections}"
  class:foldedWithSelections="{!hasNoQuery && !visible && withSelections}"
  class:withNoSelections="{!hasNoQuery && visible && !withSelections}"
  class:withSelections="{!hasNoQuery && visible && withSelections}"
  on:transitionend="{transitionended}"
  on:transitionstart="{transitionstarted}"
>
  <!-- <div class="tabs">
    <ul>
      {#each facetTabs as {id, label}}
      <li
        class:selected="{id === selectedFacet}"
      >
        <RouterLink
          on:navigate={onFacetTabClick(id)}
          base={searchRouteName}
          href={id}
        >
          <div>{label}</div>
        </RouterLink>
      </li>
      {/each}
    </ul>
  </div> -->
  <div class="content">
    <slot></slot>
  </div>
</div>

<style lang="less">
  @import '../../styles/mixins.less';

  .facets {
    padding-left: var(--sidebar-width);
    height: 100%;
    width: 100%;
    display: flex;

    .drawerTransition();

    .content {
      flex: 1;
      height: 100%;
      max-height: 100%;
    }
  }
</style>
