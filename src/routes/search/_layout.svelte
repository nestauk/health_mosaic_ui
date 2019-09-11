<script context="module">
  export const SEARCH = {};
</script>

<script>
  import { stores } from '@sapper/app';
  import { tick, onMount, onDestroy, setContext } from 'svelte';
  import { isIterableEmpty, isObjNotEmpty } from '@svizzle/utils';
  import compare from 'just-compare';
  import * as _ from 'lamb';

  import Dirty from '../../components/Dirty.svelte'
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

  import { project_title, searchRouteName } from '../../config.js';
  import { screenMachine } from '../../services/screen_service.ts';
  import {
    screenStore,
    idStore,
    currentTab,
    queryObj
  } from '../../stores/search.ts';
  import { shouldResizeStore } from '../../stores/';
  import { capitalise, titleCase } from '../../util/string';

  const { page } = stores();


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

  $: uiQuery = $screenStore[$currentTab] ? $screenStore[$currentTab].uiQuery : [];
  $: hasNoQuery = uiQuery[0] && uiQuery[0].terms.length && uiQuery[0].terms[0].term.length;
  $: withSelections = $screenStore[$currentTab] && isObjNotEmpty($screenStore[$currentTab].selections);
  $: visible = $screenStore[$currentTab] && $screenStore[$currentTab].visible;
  $: searchMachines = $screenMachine.context.searchMachines;
  $: searchMachine = $screenMachine.context.searchMachines[$currentTab];
  $: isLoading = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Pending');
  $: isError = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Error');
  $: tabs = Object.entries($screenStore).map(([id, t]) => ({id, name: t.name, isLoading: searchMachines[id] && searchMachines[id].state.matches('Search.NotEmpty.Dirty.Pending')}));

  // From sidebar
  $: ruleset = uiQuery !== undefined
    ? uiQuery.find(( { selected } ) => selected)
    : false;
  $: rulesetIndex = uiQuery!== undefined
    ? uiQuery.findIndex(( { selected } ) => selected)
    : false;
  $: labels = ruleset && {
    Subject: ruleset.fields.subject,
    Content: ruleset.fields.content
  };
  $: data = $screenStore[$currentTab] && $screenStore[$currentTab].results.data
  $: isDirty = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty');
  $: isEmptyQuery = uiQuery && uiQuery[0] && uiQuery[0].terms && uiQuery[0].terms.length && uiQuery[0].terms[0].term;
  $: hasPreviousQuery = $screenStore[$currentTab] && $screenStore[$currentTab].results.prevQuery;
  $: selections = $screenStore[$currentTab] ? $screenStore[$currentTab].selections : [];
  $: logic = $screenStore[$currentTab] && $screenStore[$currentTab].logic;
  $: mode = $screenMachine.matches('Form.Simple') ? 'simple' : 'complex';
  $: isOnly = uiQuery && uiQuery.length === 1;

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


  setContext(SEARCH, {
    transitionComplete:
      () => screenMachine.send({ type: 'ROUTE_CHANGE_COMPLETED' }),
    data: screenStore,
    checkDirty: () =>
      searchMachine && !searchMachine.state.matches('Search.NotEmpty.Matching'),
    select: (selection, tabId) =>
      screenMachine.send({
        type: 'SELECTION_UPDATED',
        tabId,
        selection,
        route: $page.path
      }),
    shouldResize: shouldResizeStore
  });

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
    screenMachine.send({type: 'TAB_RENAMED', labelText: value , id: parseInt(id, 10)});

  const sendRouteChanged = ({detail}) =>
    screenMachine.send({
      type: 'ROUTE_CHANGED',
      route: `/${searchRouteName}/${detail}`
    })

  /* facets */

  const facetTabs = [
    {id: 'list', label: 'List'},
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

  function checkDirty() {
    const currentQ = $queryObj[$currentTab];
    const lastQ = $screenStore[$currentTab].results.queryObj;

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

    if (currentQ.query && compare(cachedQuery, newQuery)) {
      searchMachine.send('QUERY_MATCHED')
    } else {
      searchMachine.send('QUERY_CHANGED')
    }
  }

  const newTab = () =>  screenMachine.send({type: 'TAB_CREATED', id: $idStore });

  //const sendTab_2 = (type, id) =>  screenMachine.send({type, id: parseInt(id, 10) });
  const sendTabEdit = ({detail: { value, id }}) =>
    screenMachine.send({type: 'TAB_RENAMED', labelText: value , id: parseInt(id, 10)});

  const handleChange = (text, i) => {
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

    checkDirty();
  }

  const handleSend = event => {
    query.forEach( q => q && q.handleKeyup && q.handleKeyup({key: 'Enter'}))
    event.preventDefault();
    searchMachine.send({ type:'SEARCHED', tabId: $currentTab, route: $page.path });
  };

  const handleReset = event => {
    event.preventDefault();
    screenMachine.send({ type:'QUERY_RESET', tab: $currentTab });
    checkDirty();
  };

  const newRuleset = () => {
    screenMachine.send({
      type: 'RULESET_CREATED',
      tabId: $currentTab,
      targetIndex: uiQuery.length
    })
  }

  const toggleTermStatus = (ruleIndex, termIndex) => {
    screenMachine.send({
      type: 'TERM_CLICKED',
      tabId: $currentTab,
      ruleIndex,
      termIndex
    })
    checkDirty();
  }

  const sendRule = (type, ruleIndex) => {
    screenMachine.send({
      type,
      tabId: $currentTab,
      ruleIndex
    });
    checkDirty();
  }

  const sendRuleLabel = (type, { section, status, index: labelIndex }, ruleIndex = rulesetIndex ) =>{
    screenMachine.send({
      type,
      tabId: $currentTab,
      ruleIndex,
      section: section.toLowerCase(),
      labelIndex,
    });
    checkDirty();
  }

  const copyRuleset = ruleIndex => {
    screenMachine.send({
      type: 'RULE_COPIED',
      tabId: $currentTab,
      ruleIndex,
      targetIndex: uiQuery.length
    })
    checkDirty();
  }

  const editRuleset = (ruleIndex, isEditing) => {
    screenMachine.send({
      type: 'RULE_EDITED',
      tabId: $currentTab,
      ruleIndex,
      isEditing
    })
    checkDirty();
  }

  const selectRuleset = targetIndex =>
    screenMachine.send({
      type: 'RULE_SELECTED',
      tabId: $currentTab,
      targetIndex
    })

  const changeIndex = ESIndex => {
    screenMachine.send({
      type: 'INDEX_CHANGED',
      tabId: $currentTab,
      ESIndex
    })
    checkDirty();
  }

  const toggleSelection = ({ detail }) =>
    screenMachine.send({
      type: 'SELECTION_UPDATED',
      tabId: $currentTab,
      selection: detail,
      route: $page.path
    })

  const toggleSearchLogic = ({ detail }) => {
    screenMachine.send({
      type: 'LOGIC_TOGGLED',
      tabId: $currentTab,
      logic: detail,
      route: $page.path
    })
    checkDirty();
  }

  $: selectedFacet = $page.params.facet || '';
  $: queryTitle = renderTitle($page.query.q, $page.query.i);
  $: facetTitle = selectedFacet ? `- ${titleCase(selectedFacet.replace('_', ' '))}` : ''
</script>

<svelte:options immutable={true} />

<svelte:head>
  <title>{project_title} {facetTitle} {queryTitle}</title>
</svelte:head>

<div class="SearchLayout">

  <div class="col {isSidebarLeft ? 'col1' : 'col3'}">
    <Sidebar
      on:position={({detail}) => isSidebarLeft = detail }
      {isSidebarLeft}
    >
      <div slot="sticky">
        <TabsPanel
          {isLoading}
          {isError}
          {tabs}
          activeTab="{$currentTab}"
          on:newtab="{sendTabCreated}"
          on:changetab={({detail}) => changeTab(detail)}
          on:deletetab={({detail}) => sendTab('TAB_DELETED', detail)}
          on:duplicatetab={({detail}) => sendTab('TAB_DELETED', detail)}
          on:textchange={sendTabRenamed}
        />
      </div>
      <div slot="scrollable">
        <FacetsPanel
          on:link={sendRouteChanged}
          facets={facetTabs}
        />
        <SearchPanelContainer
          on:reset={handleReset}
          on:edit={({detail}) => selectRuleset(detail)}
          on:click={handleSend}
          on:change={({ detail }) => changeIndex(detail)}
          on:newrule={newRuleset}
          on:toggle={toggleSearchLogic}
          on:modechange={({ detail }) => screenMachine.send({type: `CHANGE_SEARCH_${detail}`, tabId: $currentTab})}
          index={$screenStore[$currentTab] && $screenStore[$currentTab].index}
          {logic}
          {mode}
        >
          {#each uiQuery as { options, disabled, selected, terms, fields, isEditing }, i}
            <Rule
              on:copy={() => copyRuleset(i)}
              on:delete={() => sendRule('RULE_DELETED', i)}
              on:disable={() => sendRule('RULE_DISABLED', i)}
              on:edit={({detail}) => editRuleset(i, detail)}
              hasContent={terms && terms.length && terms[0].term && terms[0].term.length}
              {disabled}
              {isEditing}
              {mode}
              {isOnly}
            >
              <RuleQueries
                queries={terms}
                on:change={({detail}) => handleChange(detail, i)}
                on:toggle={({detail}) => toggleTermStatus(i, detail)}
                bind:this={query[i]}
                {disabled}
                {isEditing}
              />
              {#if mode === 'complex'}
                <RuleFields
                  on:toggle={({ detail }) => sendRuleLabel('LABEL_TOGGLED', detail, i)}
                  on:disable={({ detail }) => sendRuleLabel('LABEL_DISABLED', detail, i)}
                  on:delete={({ detail }) => sendRuleLabel('LABEL_DELETED', detail, i)}
                  {fields}
                  {disabled}
                  {isEditing}
                />
              {/if}
            </Rule>
          {/each}
        </SearchPanelContainer>
        <SelectionsPanel {selections} on:toggleselection={toggleSelection}/>
      </div>
    </Sidebar>
  </div>

  <div class="col {isSidebarLeft ? 'col2-3' : 'col1-2'}">
    <div class="Facet">
      <slot></slot>
    </div>

    {#if isDirty}
    <Dirty/>
    {/if}
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
    position: relative;
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
    height: 100%;
    max-height: 100%;
    background-color: var(--color-facet-background);
  }
</style>
