<script>
  import QueryControls from './QueryControls.svelte';
  import { createEventDispatcher } from 'svelte';

  export let labels, rulesetDisabled;
  const dispatch = createEventDispatcher();
  const isntStatusDefault = object => object.status !== 'default';

  $: labelArray = Object.entries(labels);
  $: hasLabels = labelArray.map(array => array[1].some(isntStatusDefault));
</script>


  {#each labelArray as [section, labelCollection], i }
    {#if hasLabels[i]}
    <ul class="tag-container">
      {#each labelCollection as { field, status, disabled, options }, index}
        {#if status !== 'default'}
          <li
            class="tags {status}"
            on:mouseenter="{() => dispatch('hover', { section, index })}"
            on:mouseleave="{() => dispatch('unhover', { section, index })}"
            style="{ rulesetDisabled ? 'opacity: 0.5;': ''} transition:opacity 0.3s;"
          >
            <span
              style="{disabled ? 'opacity: 0.5;' : ''} transition:opacity 0.3s;"
            >
              {field}
              <span class="icon-wrap">

                {#if options}
                  <QueryControls
                    status="{status}"
                    disabled={disabled}
                    on:delete="{() => dispatch('delete', { section, index } )}"
                    on:disable="{() => dispatch('disable', { section, index } )}"
                    on:toggle="{() => dispatch('toggle', { section, index } )}"
                  />
                {/if}

              </span>
            </span>
          </li>

        {/if}
      {/each}
    </ul>
    {/if}
  {/each}

<style>
.tag-container {
    display: flex;
    margin: 10px 5px;
    padding: 0px 0px;
    border: none;
    position: relative;
    font-size: 15px;
    height: 2rem;
    border-bottom: 1px solid #ccc;
    border-radius: 1rem;
    color: #333;
  }



  .tags {
    cursor: pointer;
    margin: 0;
    font-weight: 400;
    line-height: 1;
    position: relative;
    min-width: 5.7rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .tags span {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    width: 100%;
    position: absolute;
    transform: translateY(0.5px);
  }
  .excluded {
    color: red;
  }
  .included {
    color: limegreen;
  }
  .default {
    color: #ccc;
  }
</style>
