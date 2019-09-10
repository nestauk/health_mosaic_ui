<script>
  import { stores } from '@sapper/app';
  import { tick, createEventDispatcher } from 'svelte';
  import compare from 'just-compare';
  import * as _ from 'lamb';
  import { ArrowDown } from '../Icons/'


  import { SearchPanelContainer, Rule, RuleQueries, RuleFields } from './SearchPanel';
  import SelectionsPanel from './SelectionsPanel.svelte';
  import { screenMachine } from '../../services/screen_service.ts';
  import {
    screenStore,
    idStore,
    currentTab,
    queryObj
  } from '../../stores/search.ts'

  const { page } = stores();
  const dispatch = createEventDispatcher();

  let query = [];
  export let isSidebarLeft = true;

  $: searchMachine = $screenMachine.context.searchMachines[$currentTab];
  $: uiQuery = $screenStore[$currentTab] && $screenStore[$currentTab].uiQuery;
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
  $: data = $screenStore[$currentTab].results.data
  $: open = $screenStore[$currentTab].visible;
  $: isLoading = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Pending');
  $: isError = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty.Error');
  $: isDirty = searchMachine && searchMachine.state.matches('Search.NotEmpty.Dirty');
  $: tabs = Object.entries($screenStore);
  $: isEmptyQuery = uiQuery[0] && uiQuery[0].terms.length && uiQuery[0].terms[0].term;
  $: hasPreviousQuery = $screenStore[$currentTab].results.prevQuery;
  $: selections = $screenStore[$currentTab] ? $screenStore[$currentTab].selections : [];
  $: logic = $screenStore[$currentTab].logic;
  $: if (!open && !isEmptyQuery) openDrawer();
  $: mode = $screenMachine.matches('Form.Simple') ? 'simple' : 'complex';
  $: isOnly = uiQuery.length === 1;

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

  const sendTab = (type, id) =>  screenMachine.send({type, id: parseInt(id, 10) });
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
</script>

<div class="sidebar">
  <div>
    <slot name="sticky"></slot>
  </div>
  <div class="scrollable">
    <slot name="scrollable"></slot>
  </div>
  <div class="controls">
    <span
      class="left"
      class:active={!isSidebarLeft}
      on:click|stopPropagation={() => !isSidebarLeft && dispatch('position', true)}
    >
      <ArrowDown />
    </span>
    <span
      class="right"
      class:active={isSidebarLeft}
      on:click|stopPropagation={() => isSidebarLeft && dispatch('position', false)}
    >
      <ArrowDown />
    </span>
  </div>
</div>

<style lang="less">
  .sidebar {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background: var(--color-sidebar-background);

    display: flex;
    flex-direction: column;

    .scrollable {
      flex: 1;
      overflow-y: scroll;
      padding: 15px;
    }

    .controls {
      height: 2rem;
      display: flex;
      justify-content: space-between;
      margin: var(--size-bars-padding);

      span {
        display: block;
        height: 2rem;
        width: 2rem;
        opacity: 0.2;

        &.left {
          transform: rotate(90deg)
        }

        &.right {
          transform: rotate(-90deg)
        }

        &.active {
          cursor: pointer;
          opacity: 0.5;
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
</style>
