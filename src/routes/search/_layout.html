<script context="module">
  export const SEARCH = {};
</script>

<script>
  import { stores } from '@sapper/app';
  import { onMount, setContext } from 'svelte';

  import Nav from '../../components/Nav.svelte';
  import QueryBuilder from '../../components/QueryBuilder.svelte';

  import { screenMachine } from '../../services/screen_service.ts';

  import {
    screenStore,
    idStore,
    currentTab,
  } from '../../stores/search.ts'

  import { searchRouteName } from '../../config';
  const { page } = stores();

  onMount(() => {
    if($page.query && $page.query.q) {
      searchMachine.send('QUERY_ENTERED')
      searchMachine.send({ type:'SEARCHED', tab: $currentTab });
    }
  })

  screenMachine.send({
    type: 'TAB_CREATED',
    id: $idStore,
    route: $page.path,
    queryParams: $page.query && $page.query.q,
    ESIndex: $page.query && $page.query.i,
    isPageInit: true
  });

  setContext(SEARCH, {
    transitionComplete: () => screenMachine.send({ type: 'ROUTE_CHANGE_COMPLETED' }),
    data: screenStore,
    checkDirty: () => searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty')
  });

  $: searchMachine = $screenStore[$currentTab] && $screenStore[$currentTab].searchMachine;
  $: isLoading = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Pending');
  $: isError = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Error');
  $: tabs = Object.entries($screenStore);

  const sendTabCreated = () =>  screenMachine.send({
    type: 'TAB_CREATED',
    id: $idStore,
    route: $page.path,
    queryParams: $page.query && $page.query.q,
    ESIndex: $page.query && $page.query.i
  });

  const sendTab = (type, id) =>  screenMachine.send({
    type,
    id: parseInt(id, 10),
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
    {id: 'volume_geo', label: 'Volume by Geo'},
    {id: 'facet1', label: 'facet 1'},
    {id: 'facet2', label: 'facet 2'},
    {id: 'facet3', label: 'facet 3'},
  ];

  const onFacetTabClick = id => () => {
    sendRouteChanged(id);
  }

  $: selectedFacet = $page.params.facet || '';
</script>

<svelte:head>
  <title>Search</title>
</svelte:head>

<Nav
  {isLoading}
  {isError}
  {tabs}
  activeTab="{$currentTab}"
  on:newtab="{sendTabCreated}"
  on:changetab="{({detail}) => sendTab('TAB_SELECTED', detail)}"
  on:deletetab="{({detail}) => sendTab('TAB_DELETED', detail)}"
  on:textchange={sendTabRenamed}
/>

<QueryBuilder />

<!-- <div class="facets" class:dirty="{dirty}"> -->
<div class="facets">
  <div class="tabs">
    <ul>
      {#each facetTabs as {id, label}}
      <li
        class:selected="{id === selectedFacet}"
        on:click="{onFacetTabClick(id)}"
      >
        {label}
      </li>
      {/each}
    </ul>
  </div>
  <div class="content">
    <slot></slot>
  </div>
</div>

<style lang="less">
  .facets {
    /* padding-top: 500px; */
    padding-top: 16rem;
    height: 100%;
    width: 100%;
    display: flex;

    /* &.dirty {
      background-color: grey;
      border: 1px solid red;
    } */

    .tabs {
      flex: 0 0 200px;
      height: 100%;
      border-right: 1px solid #efefef;
      box-shadow: 1em 1em 1em #efefef;

      ul {
        width: 200px;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #ccc;

        li {
          border-bottom: 1px solid #ccc;
          padding: 20px;
          cursor: pointer;
          user-select: none;

          &:hover {
            background: #f5f5f5;
          }

          &.selected {
            background: #ececec;
            /* color: #333; */
          }
        }
      }
    }

    .content {
      flex: 1;
      height: 100%;
      max-height: 100%;
    }
  }
</style>
