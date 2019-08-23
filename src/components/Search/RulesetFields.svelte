<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { RULESETS } from './SearchContainer.svelte';
  import { RULESET } from './Ruleset.svelte';

  const { rulesets } = getContext(RULESETS);
  const key = getContext(RULESET);
  const dispatch = createEventDispatcher();

  export let disabled;
  export let fields = [
    {name: 'name', status: 'default', },
    {name: 'place', status: 'default', },
    {name: 'terms', status: 'default', },
    {name: 'content', status: 'default', }
  ];

  const makeFields = ({ subject, content }) => {
    let fields = [];
    subject.forEach( v => fields.push({...v, section: 'subject'}))
    content.forEach( v => fields.push({...v, section: 'content'}))
    return fields;
  }

  $: all_fields = makeFields(fields);
  $: console.log(all_fields)
  $: isEditing = $rulesets.get(key);
  $: allDefault = all_fields.every(({status}) => status === 'default');

  const handleCheckbox = (section, status, index, field) => event => {
    const _i = fields[section].findIndex(v => v.field === field);
    if (event.target.checked)
      dispatch('select', { section, index: _i, status })
    else if (!event.target.checkbox && all_fields[index].status === status)
      dispatch('select', { section, index: _i, status: 'default' });
  }

  const disableField = (section, status, index, field) => event => {
    const _i = fields[section].findIndex(v => v.field === field);
    dispatch('select', { section, index: _i, status: 'default' });
  }

  const flipField = (section, status, index, field) => event => {
    const _i = fields[section].findIndex(v => v.field === field);
    const status = all_fields[index].status === 'included' ? 'excluded' : 'included';
    dispatch('select', { section, index: _i, status})
  }


</script>

<div class="field-container" class:isEditing class:disabled>
  <ul>
    {#each all_fields as { field, status, section }, i}
      {#if isEditing}
        <li class:allDefault>
          <label>{field}</label>
          <input
            class="red" type="checkbox"
            on:change={handleCheckbox(section, 'excluded', i, field)}
            checked={status === 'excluded'}
        />
          <input
          class="green"
          type="checkbox"
          on:change={handleCheckbox(section, 'included', i, field)}
          checked={status === 'included'}
        />

        </li>
      {:else if !isEditing && status !== 'default'}
        <li class="{status}">
          <label class="{status}"
            on:click={flipField(section, 'included', i, field)}
          >
            {field}
            <span
              on:click|stopPropagation={disableField(section, 'included', i, field)}
            >
              x
            </span>
          </label>
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style lang="less">
  .field-container {
    margin-bottom: 10px;
    transition: 0.2s;

    &.isEditing {
      ul {
        flex-wrap: wrap;
        justify-content: space-between;
        li {
          width: 40%;
          background: none;
          border: none;
        }
      }

    }

    ul {
      margin: 0 10px;
      padding: 0;
      display: flex;
      justify-content: flex-start;
      user-select: none;
      flex-wrap: wrap;

      li {
        display: flex;
        padding: 1px 10px;
        border: 1px solid #ccc;
        margin: 5px;
        border-radius: 30px;
        font-size: 0.9rem;

        &.included {
          border-color: red;
        }
        &.excluded {
          border-color: green;
        }

        &.allDefault input.green::after {
          background: #ccc;
        }
        label {
          cursor: pointer;

          span {
            font-weight: 700;
            margin-left: 5px;
          }
        }

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

  .disabled {
    opacity: 0.6;
  }
</style>
