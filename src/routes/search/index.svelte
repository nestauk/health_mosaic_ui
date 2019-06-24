<script>
  import { getContext } from 'svelte';

  import { Results, ResultsItem } from '../../components/Results';
  import { screenStore, currentTab } from '../../stores/search.ts';
  import { SEARCH } from './_layout.svelte';

  const { checkDirty } = getContext(SEARCH);

  $: currentData = $screenStore[$currentTab].results.data;

  $: isDirty = $screenStore && checkDirty();
</script>

<div class="content">
  <Results dirty="{isDirty}">
    {#each currentData as data }
    <ResultsItem {data}></ResultsItem>
    {/each}
  </Results>
</div>
