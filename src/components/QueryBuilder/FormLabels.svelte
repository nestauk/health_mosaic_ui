<script>
  import * as _ from 'lamb';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const allDefault = _.every(({status}) => status === 'default');

  export let labels;
</script>

{#each Object.entries(labels) as [type, label]}
  <div>
    <fieldset>
      {#each label as { field, status }, i}
      <label
        class="{status}"
        on:click="{() => dispatch('select', { type, i })}"
        for="subject-{field}"
      >
        {field}
      </label>
      <select class="sr-only" id="subject-{field}">
        <option value="default">Default</option>
        <option value="include">Include</option>
        <option value="exclude">Exclude</option>
      </select>
      {/each}
    </fieldset>
    <span class="label {allDefault(label) ? 'default' : 'changed'}">{type}</span>
  </div>
{/each}

<style>
  .label {
    margin-left: 15px;

    display: block;
    font-size: 0.8rem;
    margin-top: -10px;
  }

  .label.tip {
    margin-left: 15px;
    padding-top: 1px;
    display: block;
    font-size: 0.8rem;
    margin-top: 5px;
  }

  .label.default {
    color: limegreen;
  }

  .label.changed {
    color: grey;
  }

  fieldset {
    cursor: pointer;
    margin: 15px;
    font-weight: 300;
    user-select: none;
    border: solid 1px #ddd;
    padding: 5px 10px;
    border-radius: 2px;
    /* margin-left: -6px; */
  }

  fieldset:last-of-type {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  fieldset:first-of-type {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  fieldset label {
    cursor: pointer;
    margin: 0 5px;
    font-weight: 300;
    user-select: none;
  }

  label.excluded {
    color: red;
  }
  label.included {
    color: limegreen;
  }
  label.default {
    color: #ccc;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
