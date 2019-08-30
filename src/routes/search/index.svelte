<script>
  import Fallback from '../../components/Fallback.svelte';
  import { screenStore, currentTab } from '../../stores/search.ts';

  $: selectedItems = $screenStore[$currentTab].selected || [];


</script>

<div class="content">
  {#if selectedItems.length}
    <Fallback message="Select a facet." />
  {:else}
    <Fallback message="No results. Make a new search." />
  {/if}
</div>

<style lang="less">
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
