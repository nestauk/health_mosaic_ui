<script>
  import { SearchContainer, Ruleset, RulesetQueries, RulesetFields } from './Search';
  export let val;

  let mode = 'simple';

  import { stores } from '@sapper/app';
  import { tick } from 'svelte';
  import compare from 'just-compare';
  import * as _ from 'lamb';

  // import { Form, FormInput, FormLabels, FormDropdown, FormControls } from './QueryBuilder/Form';
  // import { Rules, Ruleset, RulesetQueries, RulesetLabels } from './QueryBuilder/Rules';
  // import Selections from './Selections.svelte';



  import { screenMachine } from '../services/screen_service.ts';
  import {
    screenStore,
    idStore,
    currentTab,
    queryObj
  } from '../stores/search.ts'

  const { page } = stores();

  let formHeight;
  let input;

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
  $: selections = $screenStore[$currentTab] && $screenStore[$currentTab].selections;
  $: logic = $screenStore[$currentTab].logic;
  $: if (!open && !isEmptyQuery) openDrawer();

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

  const handleChange = ({ detail }) => {
    screenMachine.send({
      type: 'TEXT_CHANGED',
      tabId: $currentTab,
      ruleIndex: rulesetIndex,
      text: detail
    });

    if ($queryObj[$currentTab]) {
      searchMachine.send('QUERY_ENTERED')
    } else {
      searchMachine.send('QUERY_CLEARED')
    }
    checkDirty()
  }

  const handleSend = event => {
    event.preventDefault();
    searchMachine.send({ type:'SEARCHED', tabId: $currentTab, route: $page.path });
  };

  const handleReset = event => {
    event.preventDefault();
    screenMachine.send({ type:'QUERY_RESET', tab: $currentTab });
    checkDirty();
    input.focus();
  };

  const newRuleset = () => {
    input.focus();
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

  const sendRuleLabel = (type, { section, index: labelIndex }, ruleIndex = rulesetIndex ) =>{
    screenMachine.send({
      type,
      tabId: $currentTab,
      ruleIndex,
      section: section.toLowerCase(),
      labelIndex
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

  // const openDrawer = async () => {
  //   await tick();
  //   sendTab('TAB_VISIBILITY_TOGGLED', $currentTab);}
</script>

<div>
  <SearchContainer>
    <!-- <button
      class={mode}
      on:click={() => mode = mode === 'simple' ? 'complex' : 'simple'}
    >
      {mode === 'simple' ? 'C' : 'S'}
    </button> -->
    {#each uiQuery as { options, disabled, selected, terms, fields }, i}
      <Ruleset>
        <RulesetQueries queries={terms} on:change={handleChange}/>
        <RulesetFields />
      </Ruleset>
    {/each}
  </SearchContainer>
</div>

<style lang="less">
  div {
    position: fixed;
    height: 100%;
    width: var(--sidebar-width);
    border-right: 1px solid #e1e4e8;
    padding: 15px;
    box-sizing: border-box;
    background: #fafbfc;
    overflow-y: scroll;

    /* button {
      height: 30px;
      border: none;
      background: none;
      width: 100%;
      border-bottom: 1px solid #ccc;
      margin-bottom: 25px;
      position: relative;
      color: transparent;
      outline: none;

      &::after {
        content: '';
        position: absolute;
        height: 2em;
        width: 2em;
        transform: translateY(1.3em);
        border-radius: 50%;
        border: 1px solid #ccc;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
      }


    } */
  }
</style>
