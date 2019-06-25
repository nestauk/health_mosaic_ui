<script>
  import { getContext } from 'svelte';
  import * as _ from 'lamb';

  import { Results, ResultsItem } from '../../components/Results';
  import { screenStore, currentTab } from '../../stores/search.ts';
  import { SEARCH } from './_layout.svelte';

  const { checkDirty } = getContext(SEARCH);

  $: selectedItems = $screenStore[$currentTab].selected;
  $: isDirty = $screenStore && checkDirty();
</script>

<div class="content">
  <Results dirty="{isDirty}">
    <p>Found {selectedItems.length} items</p>
    {#each selectedItems as data, index}
    <ResultsItem {data} {index}></ResultsItem>
    {/each}
  </Results>
</div>

<style lang="less">
  .content {
    height: 100%;
    overflow-y: auto;
  }
</style>
