<script>
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';
  import { scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let disabled;
  export let fields;
  export let isEditing;

  const makeFields = ({ subject, content }) => {
    let fields = [];
    subject.forEach( v => fields.push({...v, section: 'subject'}))
    content.forEach( v => fields.push({...v, section: 'content'}))
    return fields;
  }
  $: all_fields = makeFields(fields);
  $: current_fields = isEditing ? all_fields : all_fields.filter(({ status }) => status !== 'default');

  const find_field = (section, field) => fields[section].findIndex(v => v.field === field);

  const disableField = (section, field) => {
    const _i = find_field(section, field);
    dispatch('disable', { section, index: _i });
  }

  const toggleField = (section, field) => {
    const _i = find_field(section, field);
    dispatch('toggle', { section, index: _i})
  }

  const deleteField = (section, field) => event => {
    const _i = find_field(section, field);
    dispatch('delete', { section, index: _i, status: 'default' });
  }

  let timer, action_completed;

  const handle_mousedown = (section, field) => event => {
    timer = setTimeout(() => {
      disableField(section, field);
      action_completed = true;
    }, 400)
  }

  const handle_mouseup = (section, field) => event => {
    if (action_completed) {
      action_completed = false;
    } else {
      clearTimeout(timer);
      toggleField(section, field);
    }
  }
</script>

<div
  class="field-container"
  class:isEditing class:disabled
>
  <ul>
    {#each current_fields as { field, status, section, disabled }, i (field)}
      <li
        in:scale={{delay: 100}}
        out:scale={{delay: 0}}
        animate:flip={{duration: 500}}
        class:disabled
        on:mousedown={handle_mousedown(section, field)}
        on:mouseup={handle_mouseup(section, field)}
        class="{status}"
      >
        {field}
        <span on:click={deleteField(section, field)}>x</span>
      </li>
    {/each}
  </ul>
</div>

<style lang="less">
  .field-container {
    margin-bottom: 10px;
    transition: 0.2s;

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
        cursor: pointer;

        &.included {
          border-color: red;
        }
        &.excluded {
          border-color: green;
        }

        span {
          font-weight: 700;
          margin-left: 5px;
        }
      }
    }
  }

  .disabled {
    opacity: 0.6;
  }
</style>
