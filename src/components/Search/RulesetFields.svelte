<script>
  import { getContext } from 'svelte';
  import { RULESETS } from './SearchContainer.svelte';
  import { RULESET } from './Ruleset.svelte';

  const { rulesets } = getContext(RULESETS);
  const key = getContext(RULESET);

  $: isEditing = $rulesets.get(key);

  export let fields = [
    {name: 'name', status: 'default', },
    {name: 'place', status: 'default', },
    {name: 'terms', status: 'default', },
    {name: 'content', status: 'default', }
  ];

  const handleCheckbox = (status, index) => event => {

    if (event.target.checked) fields[index].status = status;
    else if (!event.target.checkbox && fields[index].status === status) fields[index].status = 'default';
  }
</script>

<div class="field-container" class:isEditing>
  <ul>
    {#each fields as { name, status }, i}
      {#if isEditing}
        <li>
          <label>{name}</label>
          <input class="red" type="checkbox" on:change={handleCheckbox('excluded', i)} checked={status === 'excluded'}/>
          <input class="green" type="checkbox" on:change={handleCheckbox('included', i)} checked={status === 'included'}/>
        </li>
      {:else if !isEditing && status !== 'default'}
        <li>
          <label class="{status}">{name}</label>
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style lang="less">
  .field-container {
    margin-bottom: 10px;

    ul {
      margin: 0 10px;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      li {
        display: flex;
        display: flex;
        width: 40%;
        margin-bottom: 5px;

        input {
          position: relative;
          width: 1.3em;
          height: 1.3em;
          background-color: white;
          border-radius: 3px;
          vertical-align: middle;
          border: 2px solid #ddd;
          -webkit-appearance: none;
          outline: none;
          cursor: pointer;

          &::after {
            position: absolute;
            content: '';
            background: #fff;
            border-radius: 1px;
            width: calc(100% - 1px);
            border: 0.5px solid #fff;
            height: calc(100% - 1px);
          }

          &:first-of-type {
            margin-left: auto;
          }
          /* .checkbox-round { */
          &.green:checked::after {
            background-color:  #8cc1c1;
          }

          &.red:checked::after {
            background-color:  #f77c66;
          }

          &.green {
            border-color: #43b192;
          }

          &.red {
            border-color: #f76146;
          }
        }



      }
    }
  }
</style>
