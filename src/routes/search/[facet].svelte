<script>
  import { stores } from '@sapper/app';
  const { page } = stores();

  $: console.log($page)

</script>


<div class="content">
  <!-- {#if data && $searchStore.data[tab] && $searchStore.data[tab].length } -->

   <h1>{$page.params.facet}</h1>
  <!-- {/if} -->
</div>

