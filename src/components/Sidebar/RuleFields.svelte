<script>
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';

  import { XIcon } from 'svelte-feather-icons';

  const dispatch = createEventDispatcher();

  export let disabled;
  export let fields;

  const makeFields = ({ subject, content }) => {
    let fields = [];
    subject.forEach( v => fields.push({...v, section: 'subject'}))
    content.forEach( v => fields.push({...v, section: 'content'}))
    return fields;
  }

  $: all_fields = makeFields(fields);

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
  class:disabled
>
  <ul>
    {#each all_fields as { field, status, section, disabled }, i (field)}
      <li
        animate:flip={{duration: 500}}
        class:disabled
        on:mousedown={handle_mousedown(section, field)}
        on:mouseup={handle_mouseup(section, field)}
        class="{status}"
      >
        {field}
        {#if status !== 'default'}
          <span on:click|stopPropagation={deleteField(section, field)}>
            <XIcon />
          </span>
        {/if}
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
          background: var(--color-highlight) !important;
          color: #222 !important;
          font-weight: 400!important;
          border-color: var(--color-highlight);
          padding: 1px 4px 1px 10px;
        }
        &.excluded {
          background: var(--color-excluded) !important;
          font-weight: 400!important;
          border-color: var(--color-excluded);
          padding: 1px 4px 1px 10px;
          color: #eee !important;
          span {
            color: #fff;
          }
        }
        &.default {
          background: #eee;
        }
        span {
          font-weight: 700;
          margin-left: 10px;
          color: #333;
          width: 1.2em;
          height: 1.2em;
          transform: translate(-1px, 3px);
          opacity: 0.6;
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
  .disabled {
    opacity: 0.6;
  }
</style>
