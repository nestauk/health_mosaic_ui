<script>
  import { Results, ResultsItem } from '../../components/Results';
  import { screenStore, currentTab } from '../../stores/search.ts'

  $: data = $screenStore[$currentTab].results.data

</script>


<div class="content">
  <!-- {#if data && $searchStore.data[tab] && $searchStore.data[tab].length } -->

    <Results dirty={false}>
      {#each data as data }
        <ResultsItem {data}></ResultsItem>
      {/each}
    </Results>
  <!-- {/if} -->
</div>