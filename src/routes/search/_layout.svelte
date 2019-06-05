<script>
  import QueryManager from '../../components/QueryManager.svelte';
  import { machine } from '../../machines/screen_machine.ts';

  $: console.log($machine.value);

</script>

<svelte:head>
  <title>Search</title>
</svelte:head>

<QueryManager />


<div class="content">
  <slot></slot>
</div>

<ul>
  <li><a href="/search/facet1" on:click={() => machine.send({type: 'ROUTE_CHANGED', path: '/search/facet1'})}>facet1</a></li>
  <li><a href="/search/facet2" on:click={() => machine.send({type: 'ROUTE_CHANGED', path: '/search/facet2'})}>facet2</a></li>
  <li><a href="/search/facet3" on:click={() => machine.send({type: 'ROUTE_CHANGED', path: '/search/facet3'})}>facet3</a></li>
</ul>

<style>
ul {
  margin-top: 500px;
}
.content {
  padding-top: 200px;
}
</style>