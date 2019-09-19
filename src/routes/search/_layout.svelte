<script context="module">
  export const SEARCH = {};
</script>

<script>
  import { tick, onMount, onDestroy, setContext } from 'svelte';
  import isEqual from 'just-compare';
  import * as _ from 'lamb';

  import { stores } from '@sapper/app';
  import DirtyOverlay from '../../components/DirtyOverlay.svelte'
  import ItemsFigures from '../../components/ItemsFigures.svelte'
  import FacetsPanel from '../../components/Sidebar/FacetsPanel.svelte';
  import TabsPanel from '../../components/Sidebar/TabsPanel.svelte';
  import SelectionsPanel from '../../components/Sidebar/SelectionsPanel.svelte';
  import {
    SearchPanelContainer,
    Rule,
    RuleQueries,
    RuleFields
  } from '../../components/Sidebar/SearchPanel';
  import Sidebar from '../../components/Sidebar/Sidebar.svelte';

  import {
    CB_type,
    project_title,
    MU_type,
    NIH_type,
    searchRouteName,
    typeLabels,
  } from '../../config.js';
  import {
    matchesDirty,
    matchesError,
    matchesPending
  } from '../../machines/search_machine/utils.ts';
  import { screenMachine } from '../../services/screen_service.ts';
  import {
    screenStore,
    idStore,
    currentTab,
    queryObj
  } from '../../stores/search.ts';
  import { shouldResizeStore } from '../../stores/';
  import { countByTypeAsKeyValue } from '../../util/domain';
  import { capitalise, titleCase } from '../../util/string';

  const { page } = stores();
  const facetPills = [
    {id: '', label: 'List'},
    {id: 'volume_geo', label: 'Volume by Country'},
    {id: 'map_geo', label: 'Locations'},
    {id: 'volume_terms', label: 'Volume by Term'},
    {id: 'volume_countries', label: 'Volume by Mentioned Countries'},
    {id: 'volume_funders', label: 'Volume by Funder'},
  ];

  const renderTitle = (query = '', type = '') => {
    let typeTitle;
    if (!type) {
      typeTitle = '';
    } else {
      typeTitle = capitalise(type);
    }

    return query ? `- ${typeTitle} ${query}` : '';
  }

  let isSidebarLeft = true;
  let popped = false;
  let query = [];
  let searchMachine;

  onMount(() => {
    if($page.query && $page.query.q) {
      const hasLabels = !!$page.query.q.match(/\(.+,in:.+\)/);
      const hasRulesets = !!$page.query.q.match(/(?:\(.+\)){2,}/);

      if(hasLabels || hasRulesets) {
        screenMachine.send({type: 'CHANGE_SEARCH_COMPLEX', tabId: $currentTab})
      }

      searchMachine.send('QUERY_ENTERED');
      searchMachine.send('QUERY_CHANGED');
      searchMachine.send({ type:'SEARCHED', tabId: $currentTab, restore: true });
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

  // page
  $: selectedFacet = $page.params.facet || '';
  $: queryTitle = renderTitle($page.query.q, $page.query.i);
  $: facetTitle = selectedFacet ? `- ${titleCase(selectedFacet.replace('_', ' '))}` : '';

  $: currentScreen = $screenStore[$currentTab];
  $: isSingleQuery = uiQuery && uiQuery.length === 1;
  $: logic = currentScreen && currentScreen.logic;
  $: selectedItems = (currentScreen && currentScreen.selected) || [];
  $: selectedItemsVolume = selectedItems.length;
  $: selectedItemsVolumes = _.map(
    countByTypeAsKeyValue(selectedItems),
    ({key, value}) => ({key, text: `${typeLabels[key]} (${value})`})
  );
  $: selections = currentScreen ? currentScreen.selections : [];
  $: uiQuery = currentScreen ? currentScreen.uiQuery : [];
  $: searchMachines = $screenMachine.context.searchMachines;
  $: searchMachine = $screenMachine.context.searchMachines[$currentTab];
  $: isDirty = $screenStore && matchesDirty(searchMachine);
  $: tabs = $screenMachine &&
    Object.entries($screenStore)
    .map(([id, t]) => ({
      id,
      name: t.name,
      isError: matchesError(searchMachines[id]),
      isLoading: matchesPending(searchMachines[id])
    }));
  $: rulesetIndex = uiQuery!== undefined
    ? uiQuery.findIndex(( { selected } ) => selected)
    : false;

  $: mode = $screenMachine.matches('Form.Simple') ? 'simple' : 'complex';

  //  History

  const pop_callback = async (page) => {
    if (!popped) return;
    await tick();
    screenMachine.send({
      type: 'TAB_RESTORED',
      route: page.path,
      queryParams: page.query && page.query.q,
      selectionParams: page.query && page.query.s,
      ESIndex: page.query && page.query.i,
      ESLogic: page.query && page.query.o,
      currentTab: $currentTab,
      isPageInit: true
    });

    if (page.query.q) {
      searchMachine.send('QUERY_CHANGED');
      searchMachine.send({ type:'SEARCHED', tabId: $currentTab, restore: true });
    }

    popped = false;
  };

  $: pop_callback($page);

  if (process.browser) {
    window.onpopstate =  () =>  popped = true;
  }

  /* context */

  setContext(SEARCH, {
    transitionComplete:
      () => screenMachine.send({ type: 'ROUTE_CHANGE_COMPLETED' }),
    data: screenStore,
    checkDirty: () => matchesDirty(searchMachine),
    select: (selection, tabId) =>
      screenMachine.send({
        type: 'SELECTION_UPDATED',
        tabId,
        selection,
        route: $page.path
      }),
    shouldResize: shouldResizeStore
  });

  /* machine events */

  const sendTabCreated = () =>  screenMachine.send({
    type: 'TAB_CREATED',
    tabId: $idStore,
    route: $page.path,
  });

  const sendTab = (type, id) =>  screenMachine.send({
    type,
    tabId: id,
    route: $page.path,
    queryParams: $page.query && $page.query.q,
    ESIndex: $page.query && $page.query.i
  });

  const sendTabRenamed = ({detail: { value, id }}) =>
    screenMachine.send({
      type: 'TAB_RENAMED',
      labelText: value,
      id: parseInt(id, 10)
    });

  const sendRouteChanged = ({detail}) =>
    screenMachine.send({
      type: 'ROUTE_CHANGED',
      route: detail ? `/${searchRouteName}/${detail}` : `/${searchRouteName}`
    });

  const changeTab = detail => {
    sendTab('TAB_SELECTED', detail);
    screenMachine.send({
      type: 'ROUTE_CHANGED'
    })
  }

  const stripEmpties = _.filterWith(_.allOf([
    _.getPath('values.length'),
    _.getPath('values.0.query.length')
  ]));

  /*
  We could make this a derived([screenStore, currentTab, queryObj], ...)
  and when we spawn searchMachine in `createSearchMachine` we could subscribe
  to the derived and send searchMachine `QUERY_*` events so this is embedded
  in the form and does not have to be set up in the route.
  */
  function checkQuery() {
    const currentQ = $queryObj[$currentTab];
    const lastQ = currentScreen.results.queryObj;

    const cachedQuery =
      lastQ.query
      && {
        logic: lastQ.logic,
        index: lastQ.index,
        query: stripEmpties(lastQ.query)
      };

    const newQuery =
      currentQ.query
      && {
        logic: currentQ.logic,
        index: currentQ.index,
        query: stripEmpties(currentQ.query)
      };

    if (currentQ.query && isEqual(cachedQuery, newQuery)) {
      searchMachine.send('QUERY_MATCHED')
    } else {
      searchMachine.send('QUERY_CHANGED')
    }
  }

  const handleChange = (text, i, isEditing) => {
    if (text === '' && !isEditing) {
      editRuleset(i, isEditing);
    }

    screenMachine.send({
      type: 'TEXT_CHANGED',
      tabId: $currentTab,
      ruleIndex: i,
      text
    });

    if ($queryObj[$currentTab]) {
      searchMachine.send('QUERY_ENTERED')
    } else {
      searchMachine.send('QUERY_CLEARED')
    }

    checkQuery();
  }

  const handleSend = event => {
    query.forEach( q => q && q.handleKeyup && q.handleKeyup({key: 'Enter'}))
    event.preventDefault();
    searchMachine.send({ type:'SEARCHED', tabId: $currentTab, route: $page.path });
  };

  const handleReset = event => {
    event.preventDefault();
    screenMachine.send({
      type:'QUERY_RESET',
      tab: $currentTab
    });
    checkQuery();
  };

  const newRuleset = () =>
    screenMachine.send({
      type: 'RULESET_CREATED',
      tabId: $currentTab,
      targetIndex: uiQuery.length
    });

  const toggleTermStatus = (ruleIndex, termIndex) => {
    screenMachine.send({
      type: 'TERM_CLICKED',
      tabId: $currentTab,
      ruleIndex,
      termIndex
    });
    checkQuery();
  }

  const sendRule = (type, ruleIndex) => {
    screenMachine.send({
      type,
      tabId: $currentTab,
      ruleIndex
    });
    checkQuery();
  }

  const sendRuleLabel = (type, { section, status, index: labelIndex }, ruleIndex = rulesetIndex ) =>{
    screenMachine.send({
      type,
      tabId: $currentTab,
      ruleIndex,
      section: section.toLowerCase(),
      labelIndex,
    });
    checkQuery();
  }

  const copyRuleset = ruleIndex => {
    screenMachine.send({
      type: 'RULE_COPIED',
      tabId: $currentTab,
      ruleIndex,
      targetIndex: uiQuery.length
    });
    checkQuery();
  }

  const editRuleset = (ruleIndex, isEditing) => {
    screenMachine.send({
      type: 'RULE_EDITED',
      tabId: $currentTab,
      ruleIndex,
      isEditing
    });
    checkQuery();
  }

  const selectRuleset = targetIndex =>
    screenMachine.send({
      type: 'RULE_SELECTED',
      tabId: $currentTab,
      targetIndex
    });

  const changeIndex = ESIndex => {
    screenMachine.send({
      type: 'INDEX_CHANGED',
      tabId: $currentTab,
      ESIndex
    });
    checkQuery();
  }

  const toggleSelection = ({ detail }) =>
    screenMachine.send({
      type: 'SELECTION_UPDATED',
      tabId: $currentTab,
      selection: detail,
      route: $page.path
    });

  const toggleSearchLogic = ({ detail }) => {
    screenMachine.send({
      type: 'LOGIC_TOGGLED',
      tabId: $currentTab,
      logic: detail,
      route: $page.path
    });
    checkQuery();
  }

  const sendModeChange = ({ detail }) => {
    screenMachine.send({
      type: `CHANGE_SEARCH_${detail}`,
      tabId: $currentTab,
      editmode: false
    })
    checkQuery();
  }
</script>

<svelte:options immutable={true} />

<svelte:head>
  <title>{project_title} {facetTitle} {queryTitle}</title>
</svelte:head>

<div class="SearchLayout">

  <div class="col {isSidebarLeft ? 'col1' : 'col3'}">
    <Sidebar
      on:shift={() => isSidebarLeft = !isSidebarLeft }
      {isSidebarLeft}
    >
      <div slot="sticky">
        <TabsPanel
          {tabs}
          activeTab="{$currentTab}"
          on:changetab="{({detail}) => changeTab(detail)}"
          on:deleteTabs="{({detail}) => sendTab('TAB_DELETED', detail)}"
          on:duplicatetabs="{({detail}) => sendTab('TAB_COPIED', detail)}"
          on:newtab="{sendTabCreated}"
          on:textchange="{sendTabRenamed}"
        />
      </div>
      <div slot="scrollable">
        <FacetsPanel
          on:link="{sendRouteChanged}"
          facets="{facetPills}"
        />
        <SearchPanelContainer
          on:reset="{handleReset}"
          on:edit="{({detail}) => selectRuleset(detail)}"
          on:click="{handleSend}"
          on:change="{({ detail }) => changeIndex(detail)}"
          on:newrule="{newRuleset}"
          on:toggle="{toggleSearchLogic}"
          on:modechange="{sendModeChange}"
          index="{currentScreen && currentScreen.index}"
          {logic}
          {mode}
        >
          {#each uiQuery as { options, disabled, selected, terms, fields, isEditing }, i}
            <Rule
              on:copy="{() => copyRuleset(i)}"
              on:delete="{() => sendRule('RULE_DELETED', i)}"
              on:disable="{() => sendRule('RULE_DISABLED', i)}"
              on:edit="{({detail}) => editRuleset(i, detail)}"
              hasContent="{terms && terms.length && terms[0].term && terms[0].term.length}"
              {disabled}
              {isEditing}
              {mode}
              isOnly="{isSingleQuery}"
            >
              <RuleQueries
                queries="{terms}"
                on:change="{({detail}) => handleChange(detail, i, isEditing)}"
                on:commit="{({detail}) => editRuleset(i, isEditing)}"
                on:toggle="{({detail}) => toggleTermStatus(i, detail)}"
                bind:this="{query[i]}"
                {disabled}
                {isEditing}
              />
              {#if mode === 'complex'}
                <RuleFields
                  on:toggle="{({ detail }) => sendRuleLabel('LABEL_TOGGLED', detail, i)}"
                  on:disable="{({ detail }) => sendRuleLabel('LABEL_DISABLED', detail, i)}"
                  on:delete="{({ detail }) => sendRuleLabel('LABEL_DELETED', detail, i)}"
                  {fields}
                  {disabled}
                />
              {/if}
            </Rule>
          {/each}
        </SearchPanelContainer>
        <SelectionsPanel
          {selections}
          on:toggleselection="{toggleSelection}"
        />
      </div>
    </Sidebar>
  </div>

  <div class="col {isSidebarLeft ? 'col2-3' : 'col1-2'}">
    <div class="Facet">
      {#if selectedItemsVolume}
      <header>
        <ItemsFigures
          total={selectedItemsVolume}
          parts={selectedItemsVolumes}
        />
      </header>
      {/if}
      <main>
        <slot></slot>
      </main>

      {#if isDirty}
        <DirtyOverlay/>
      {/if}
    </div>
  </div>
</div>

<style lang="less">
  .SearchLayout {
    width: 100%;
    height: 100%;

    display: grid;
    grid-template-columns:
      var(--size-sidebar-width)
      1fr
      var(--size-sidebar-width);
    grid-template-rows: 100%;
  }
  .col {
    height: 100%;
    grid-row: 1;
  }
  .col1 {
    grid-column: 1 / span 1;
    border-right: var(--border-sidebar);
  }

  .col3 {
    grid-column: 3 / span 1;
    border-left: var(--border-sidebar);
  }
  .col1-2 {
    grid-column: 1 / span 2;
  }

  .col2-3 {
    grid-column: 2 / span 2;
  }

  .Facet {
    width: 100%;
    height: 100%;
    max-height: 100%;

    background-color: var(--color-facet-background);
    position: relative;

    --header-height: 3em;

    display: grid;
    grid-template-rows: var(--header-height) calc(100% - var(--header-height));
    grid-template-columns: 100%;

    header {
      grid-row: 1 / span 1;
      width: 100%;
      border-bottom: var(--border-ui);

      padding: var(--size-facet-padding);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    main {
      grid-row: 2 / span 1;
      width: 100%;
    }
  }
</style>
