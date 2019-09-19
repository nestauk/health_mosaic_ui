<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';
  import compare from 'just-compare';
  import { EyeIcon, EyeOffIcon } from 'svelte-feather-icons';

  import Fallback from '../../../components/Fallback.svelte'
  import { AddCircle, RemoveCircle } from '../../../components/Icons/'
  import { Results, Entity } from '../../../components/Results';
  import { NIH_type, CB_type, MU_type } from '../../../config';
  import { screenStore, currentTab } from '../../../stores/search.ts';
  import { SEARCH } from '../_layout.svelte';

  const { checkDirty } = getContext(SEARCH);
  const foldAll = _.mapWith(_.setKey('show', false));
  const unfoldAll = _.mapWith(_.setKey('show', true));
  const onFoldAll = () => selectedItems = foldAll(selectedItems);
  const onUnfoldAll = () => selectedItems = unfoldAll(selectedItems);

  let previousSelectedItems;
  let changed;
  let items = {};

  $: selectedItems = $screenStore[$currentTab].selected.map((v, index) =>({...v, show: false, index})) || [];
  $: {
    changed = selectedItems && !compare(previousSelectedItems, selectedItems);
    if (changed) {
      previousSelectedItems = selectedItems;
    }
  }
  $: isDirty = $screenStore && checkDirty();

</script>

<div
  class="List"
  class:dirty="{isDirty}"
>
  {#if selectedItems.length}
  <div class="header">
    <div class="buttons">
      <span on:click={onUnfoldAll}>
        <EyeIcon />
      </span>
      <span on:click={onFoldAll}>
        <EyeOffIcon />
        </span>
      </div>
  </div>

  <Results dirty="{isDirty}" {changed}>
    {#each selectedItems as item, i}
      <Entity
        data={item}
        show={item.show}
        on:show={() => selectedItems[item.index].show = true}
        on:hide={() => selectedItems[item.index].show = false}
      />
    {/each}
  </Results>

  {:else}
    <Fallback message="No results" />
  {/if}
</div>

<style lang="less">
  .List {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;

    .header {
      padding: 0.5em;
      display: flex;
      justify-content: center;
      align-items: center;

      .buttons {
        width: 66px;
        display: grid;
        height: 25px;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;

        span {
          opacity: 0.6;
          cursor: pointer;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    &.dirty {
      /* use to disable events or so */
    }
  }
</style>
