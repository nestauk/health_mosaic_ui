<script>
  import RuleControlsMaster from './RuleControlsMaster.svelte';
  import RuleControls from './RuleControls.svelte';

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let disabled, terms, selected, options;
</script>

{#if terms[0] && terms[0].term.length}
<li
  on:click="{() => dispatch('select')}"
  class:active-query="{selected}"
  class="rule"
  style="{disabled ? 'border-color: #ddd;' : ''} transition: 0.3s;"
>

  <slot></slot>

  <RuleControlsMaster
    {selected}
    {options}
    on:close
    on:open
  >

    <RuleControls
      on:disable
      {disabled}
      on:copy
      on:delete
    />

  </RuleControlsMaster>

</li>
{/if}

<style>
.rule {
    font-size: 18px;
    position: relative;
    display: flex;
    height: 3.4rem;
    border: 1px solid #ccc;
    margin: 10px;
    border-radius: 1.7rem;
    padding: 0 12px;
    transition: 0.2s;
  }
</style>
