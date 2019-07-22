<script>
  import { project_title } from '../config.js';
</script>

<svelte:head>
  <title>{project_title}</title>
</svelte:head>

<div class="container">
  <h1>{project_title}</h1>

  <h2><a href="search">search</a></h2>
  <p>
    A search widget to enable users to make complex search queries with a
    relatively simple interface. Currently shows results as a simple list.
  </p>
</div>

<style>
  h1 {
    text-align: left;
    font-size: 1.6em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 40px 0 0.5em 0;
  }

  h2 {
    font-weight: 700;
    text-align: left;
    margin-top: 60px;
  }

  h2 a {
    text-decoration: none;
    color: #555;
    border-bottom: 3px solid #ccc;
    display: inline-block;
  }

  h2 a:hover {
    color: darkorange;
    border-color: darkorange;
  }

  .container {
    width: 90%;
    max-width: 500px;
    margin: auto;
    margin-top: 40px;
  }
</style>
