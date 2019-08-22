<script>
  import { getContext } from 'svelte';
  import { RULESETS } from './SearchContainer.svelte';
  import { RULESET } from './Ruleset.svelte';

  const { rulesets } = getContext(RULESETS);
  const key = getContext(RULESET);

  $: isEditing = $rulesets.get(key);
  $: console.log(isEditing)

  export let fields = [
    {name: 'name', status: 'default', },
    {name: 'place', status: 'default', },
    {name: 'terms', status: 'default', },
    {name: 'content', status: 'default', }
  ];

  $: console.log(fields)

  const handleCheckbox = (status, index) => event => {
    console.log(status, index)
    console.log(event.target.checked);
    if (event.target.checked) fields[index].status = status;
    else if (!event.target.checkbox && fields[index].status === status) fields[index].status = 'default';
  }

  // let fieldsWithCheckboxes = [
  //   {name: 'name', status: 'default', id: 0 },
  //   {name: 'place', status: 'default', id: 1 },
  //   {name: 'terms', status: 'default', id: 2 },
  //   {name: 'content', status: 'default', id: 3 }
  // ];
</script>

<div class="field-container" class:isEditing>
  <ul>
    {#each fields as { name, status }, i}
      {#if isEditing}
        <li>
          <label>{name}</label>
          <input class="red" type="checkbox" on:change={handleCheckbox('excluded', i)}/>
          <input class="green" type="checkbox" on:change={handleCheckbox('included', i)}/>
        </li>
      {:else if !isEditing && status !== 'default'}
        <li>
          <label>{name} -  {status}</label>
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style lang="less">
  .field-container {
    margin-bottom: 30px;

    &.isEditing {

      ul {
        flex-direction: column;
      }
    }

    ul {
      margin: 0 0 0 10px;
      padding: 0;
      display: flex;

      li {
        display: flex;

        input:first-of-type {
          margin-left: auto;

          &.green {
            color: green;
          }

          &.red {
            color: red;
          }
        }
      }
    }

  }
</style>
