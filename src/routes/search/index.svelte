<script>
  import { getContext } from 'svelte';
  import { isObjEmpty } from '@svizzle/utils';

  import { stores } from '@sapper/app';

  import Fallback from '../../components/Fallback.svelte';
  import { screenStore, currentTab } from '../../stores/search.ts';
  import { SEARCH } from './_layout.svelte';
  import { list } from './facets';

  const { checkDirty, shouldResize } = getContext(SEARCH);
  const { page } = stores();

  $: isDirty = $screenStore && checkDirty();
  $: selectedItems = $screenStore[$currentTab].selected;
</script>

<div class="SearchIndex">
  {#if isObjEmpty($page.query)}
    <Fallback message="Please make a new search" />
  {:else}
    {#if selectedItems.length}
      <svelte:component
        this={list}
        {isDirty}
        {shouldResize}
      />
    {:else}
      <Fallback message="No results" />
    {/if}
  {/if}
</div>

<style lang="less">
  .SearchIndex {
    width: 100%;
    height: 100%;
  }
</style>
