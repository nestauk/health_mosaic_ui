<script>
  import { onMount } from 'svelte';
  import compare from 'just-compare';

  import Nav from './Nav.html';
  import { Form, FormInput, FormLabels } from './QueryBuilder/Form';
  import { Rules, Ruleset,RulesetQueries, RulesetLabels } from './QueryBuilder/Rules';
  
  import { subjectAliases, contentAliases } from '../config';
  import { screenStore, idStore, historyStore, currentTab, queryObj } from '../stores/search';
  import { machine } from '../machines/screen_machine.ts';

  let search,formHeight;

  $: currentMachine = $screenStore[$currentTab].machine;
  $: current = $screenStore[$currentTab] && $screenStore[$currentTab].uiQuery;
  $: currentQuery = current !== undefined ? current.find(( { selected } ) => selected) : false;
  $: currentQueryIndex = current!== undefined ? current.findIndex(( { selected } ) => selected) : false;
  $: currentLabels = currentQuery && { Subject: currentQuery.fields.subject, Content: currentQuery.fields.content };
  $:  open = $screenStore[$currentTab].visible;

  const newTab = () =>  {
    open = true; 
    machine.send({type: 'TAB_CREATED', id: $idStore });
  };

  const tabSend = (type, id) =>  machine.send({ type, id: parseInt(id, 10) });

  const sendRenameTab = ({ detail: {id, value} }) => machine.send({type: 'TAB_RENAMED', id: parseInt(id, 10), labelText: value });

  const handleChange = ({ detail }) => {
    machine.send({type: 'TEXT_CHANGED', tabId: $currentTab, ruleIndex: currentQueryIndex, text: detail})
    
    if ($queryObj[$currentTab]) {
        currentMachine.send('QUERY_ENTERED')
    } else {
        currentMachine.send('QUERY_CLEARED')
    }

    const stripEmpties = (arr) => arr.filter(v => v.values.length && v.values[0].query.length);

    const cachedQuery = $queryObj[$currentTab] && stripEmpties($screenStore[$currentTab].results.queryObj);
    const newQuery = $queryObj[$currentTab] && stripEmpties($queryObj[$currentTab]);

    if ($queryObj[$currentTab] && compare(cachedQuery, newQuery)) {
        currentMachine.send('QUERY_MATCHED')
      } else {
        currentMachine.send('QUERY_CHANGED')
      }
  }

  const handleSend = (rules) => currentMachine.send({ type:'SEARCHED', tab: $currentTab });

  const newRuleset = () => 
    machine.send({
      type: 'RULESET_CREATED',
      tabId: $currentTab,
      targetIndex: current.length
    })

  const toggleTermStatus = (ruleIndex, termIndex) =>
    machine.send({
      type: 'QUERY_CLICKED',
      tabId: $currentTab,
      ruleIndex,
      termIndex
    })

  const sendRule = (type, ruleIndex) =>
    machine.send({
      type,
      tabId: $currentTab,
      ruleIndex
    });
  
  const sendRuleLabel = (type, { section, index: labelIndex } ) => 
    machine.send({
      type,
      tabId: $currentTab,
      ruleIndex: currentQueryIndex,
      section: section.toLowerCase(),
      labelIndex
    });

  const copyRuleset = (ruleIndex) =>
    machine.send({
      type: 'RULE_COPIED',
      tabId: $currentTab,
      ruleIndex,
      targetIndex: current.length
    })

  const selectRuleset = (targetIndex) => 
    machine.send({
      type: 'RULE_SELECTED',
      tabId: $currentTab,
      targetIndex
    })

</script>

<Nav
  tabs={$screenStore}
  activeTab="{$currentTab}"
  on:newtab="{newTab}"
  on:changetab="{({detail}) => tabSend('TAB_SELECTED', detail)}"
  on:deletetab="{({detail}) => tabSend('TAB_DELETED', detail)}"
  on:textchange="{sendRenameTab}"
/>

<div class="search" bind:offsetHeight="{search}" style="{open ? '' : `transform: translateY(-${formHeight + 40}px)`}">
  <Form
    bind:formHeight
    on:submit|preventDefault="{handleSend}"
    on:newrule="{newRuleset}"
    on:search="{handleSend}"
  >
    <FormInput
      on:change="{handleChange}"
      on:enter="{newRuleset}"
      current={currentQuery.terms}
    />
    <FormLabels
      on:select="{({ detail }) => sendRuleLabel('LABEL_CLICKED', detail)}"
      labels="{currentLabels}"
    />
  </Form>


  {#if current.length}
  <Rules>
    {#each current as { options, disabled, selected, terms, fields }, i}
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
          terms={terms}
          on:toggle="{({detail}) => toggleTermStatus(i, detail)}"
        />
        <RulesetLabels
          rulesetDisabled={disabled}
          labels="{{ subject: fields.subject, content: fields.content }}"
          on:hover={({ detail }) => sendRuleLabel('LABEL_OPTIONS_SELECTED', detail)}
          on:unhover={({ detail }) => sendRuleLabel('LABEL_OPTIONS_DISMISSED', detail)}
          on:disable={({ detail }) => sendRuleLabel('LABEL_DISABLED', detail)}
          on:delete={({ detail }) => sendRuleLabel('LABEL_DELETED', detail)}
          on:toggle={({ detail }) => sendRuleLabel('LABEL_TOGGLED', detail)}
        />
      </Ruleset>
    {/each}
  </Rules>
  {/if}
  {#if current[0] && current[0].terms[0].term}
      <div 
        class="close-label" 
        on:click="{() => tabSend('TAB_VISIBILITY_TOGGLED', $currentTab)}" 
        style="{open ? 'transform: rotate(180deg) ' : ''}"
      >
        <img alt="close search" src="arrow.svg"/>
      </div>
    {/if}
</div>


<style>
  .search {
    position: fixed;
    width: 100%;
    top: 3.5rem;
    left: 0;
    box-shadow: 0 1px 5px 1px rgba(0,0,0,0.2);
    padding: 1rem 3em 0.5em 3em;
    transition: 0.5s;
    z-index: 3;
    background: #fff;
  }
  .close-label {
    position: absolute;
    padding: 5px 0;
    cursor:pointer;
    width: 30px;
    height: 30px;
    right: 30px;
    bottom: 22px;
    transition: 0.2s;
  }

  img {
    margin-top: -5px;
  }
</style>
