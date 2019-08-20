<script>
  import { stores } from '@sapper/app';
  import { tick } from 'svelte';
  import compare from 'just-compare';
  import * as _ from 'lamb';

  import { Form, FormInput, FormLabels, FormDropdown, FormControls } from './QueryBuilder/Form';
  import { Rules, Ruleset, RulesetQueries, RulesetLabels } from './QueryBuilder/Rules';
  import Selections from './Selections.svelte';



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
  $: isEmptyQuery = uiQuery[0] && uiQuery[0].terms[0].term;
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

  const openDrawer = async () => {
    await tick();
    sendTab('TAB_VISIBILITY_TOGGLED', $currentTab);}


</script>

<div
  class="search"
  style="{open ? '' : `transform: translateY(-${formHeight + 50}px)`}"
>
  <Form
    bind:formHeight
    on:submit="{handleSend}"
    on:newrule="{newRuleset}"
  >
    <FormInput
      bind:this={input}
      on:change="{handleChange}"
      on:enter="{newRuleset}"
      current={ruleset.terms}
    />
    <FormLabels
      on:select="{({ detail }) => sendRuleLabel('LABEL_CLICKED', detail)}"
      {labels}
    />

    <FormControls
      on:toggle={toggleSearchLogic}
      on:indexchange={({ detail }) => changeIndex(detail)}
      on:send={handleSend}
      on:reset={handleReset}
      on:toggledrawer={() => sendTab('TAB_VISIBILITY_TOGGLED', $currentTab)}
      index={$screenStore[$currentTab].index}
      {logic}
      {isEmptyQuery}
      {hasPreviousQuery}
      {isDirty}
      {open}
    />

    {#if uiQuery.length}
    <Rules
      {isEmptyQuery}
      selectionsActive={!!Object.keys(selections).length}
    >
      {#each uiQuery as { options, disabled, selected, terms, fields }, i}
        <Ruleset
          {terms}
          {selected}
          {disabled}
          {options}
          on:open="{() => sendRule('RULE_OPTIONS_SELECTED', i)}"
          on:close="{() => sendRule('RULE_OPTIONS_DISMISSED', i)}"
          on:select="{() => selectRuleset(i)}"
          on:copy="{() => copyRuleset(i)}"
          on:delete="{() => sendRule('RULE_DELETED', i)}"
          on:disable="{() => sendRule('RULE_DISABLED', i)}"
        >
          <RulesetQueries
            {disabled}
            {terms}
            on:toggle="{({detail}) => toggleTermStatus(i, detail)}"
          />
          <RulesetLabels
            rulesetDisabled={disabled}
            labels="{{ subject: fields.subject, content: fields.content }}"
            on:hover={({ detail }) => sendRuleLabel('LABEL_OPTIONS_SELECTED', detail, i)}
            on:unhover={({ detail }) => sendRuleLabel('LABEL_OPTIONS_DISMISSED', detail, i)}
            on:disable={({ detail }) => sendRuleLabel('LABEL_DISABLED', detail, i)}
            on:delete={({ detail }) => sendRuleLabel('LABEL_DELETED', detail, i)}
            on:toggle={({ detail }) => sendRuleLabel('LABEL_TOGGLED', detail, i)}
          />
        </Ruleset>
        {#if uiQuery[i+1] && uiQuery[i+1].terms.length && uiQuery[i+1].terms[0].term}
          <li class="status {logic}">●</li>
        {/if}
      {/each}
    </Rules>
    <Selections {selections} on:toggleselection={toggleSelection}/>
    {/if}
  </Form>

</div>

<style lang="less">
  @import '../styles/mixins.less';

  .search {
    position: absolute;
    width: 100%;
    top: 3.5rem;
    left: 0;
    box-shadow: 0 1px 5px 1px rgba(0,0,0,0.2);
    padding: 1rem 3em 0.5em 3em;
    z-index: 3;
    background: #fff;

    .drawerTransition();
  }

  .status {
    height: 20px;
    padding: 20px 5px;
    display: flex;
    align-items: center;
    border-radius: 30px;
    margin-top: 17px;
    cursor: default;

    &.AND {
      color: #fa99ff;
    }

    &.OR {
      color: #66c9ff;
    }
  }



</style>
