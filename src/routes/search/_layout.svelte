<script>
  import QueryManager from '../../components/QueryManager.svelte';
</script>

<svelte:head>
  <title>Search</title>
</svelte:head>

<QueryManager />


<div class="content">
  <slot></slot>
</div>

<ul>
  <li><a href="/search/facet1">facet1</a></li>
  <li><a href="/search/facet2">facet2</a></li>
  <li><a href="/search/facet3">facet3</a></li>
</ul>

<style>
ul {
  margin-top: 500px;
}
.content {
  padding-top: 200px;
}
</style>