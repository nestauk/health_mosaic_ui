<script>
  import { createEventDispatcher } from 'svelte';
  import { isNotNil, stringify } from '@svizzle/utils';
  import * as _ from 'lamb';

  import { fieldToLabel } from '../../util/domain';

  const dispatch = createEventDispatcher();

  export let listSortingStore;
  console.log(stringify($listSortingStore));

  $: ({criteria, by, direction, directions} = $listSortingStore);
  $: sortControls = _.map(criteria, criterion => ({
    isSelected: criterion === by,
    criterion
  }));

  const sortBy = options => () => dispatch('sortedBy', options);
</script>

<div class="ListControls">
  <h3>Sort by</h3>
  <div class="sorting">
    {#each sortControls as {isSelected, criterion}}
    <div>
      <div>
        <span
          class="criterion"
          class:selected="{isSelected}"
        >
          {fieldToLabel[criterion]}
        </span>
      </div>
      <div>
        <span
          class="clickable order ascending"
          class:selected="{isSelected && direction === 'ascending'}"
          on:click="{sortBy({by: criterion, direction: 'ascending'})}"
        ></span>
        <span
          class="clickable order descending"
          class:selected="{isSelected && direction === 'descending'}"
          on:click="{sortBy({by: criterion, direction: 'descending'})}"
        ></span>
      </div>
    </div>
    {/each}
  </div>
</div>

<style lang="less">
  .ListControls {
    height: 100%;
    width: 100%;

    .sorting {
      width: 60%;

      & > div {
        display: flex;
        align-items: center;
        justify-content: space-between;

        & > div {
          display: inline-block;
        }
      }

      .criterion {
        &.selected {
          font-weight: bold;
        }
      }

      .order {
        font-size: 0.8em;

        &.ascending {
          &:after {
            content: '△';
          }

          &.selected {
            &:after {
              content: '▲';
            }
          }
        }

        &.descending {
          &:after {
            content: '▽';
          }

          &.selected {
            &:after {
              content: '▼';
            }
          }
        }
      }
    }
  }
</style>
