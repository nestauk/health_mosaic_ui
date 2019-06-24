<svelte:head>
  <title>Health Innovation Scanner</title>
</svelte:head>

<div class="container">
  <h1>Health Innovation Scanner</h1>

  <h2><a href="search">search</a></h2>
  <p>
    A search widget to enable users to make complex search queries with a
    relatively simple interface. Currently shows results as a simple list.
  </p>

  <h2><a href="map">map</a></h2>
  <p>
    An experimental and incomplete map editor designed to allow users to capure
    a snapshot of a map (and in the future its data) and annotate it for future
    use. Eventually users will be able to snapshot many maps (and maybe other
    visualisations too) and save them for use in custom reports.
  </p>

  <h2><a href="present">present</a></h2>
  <p>
    A partner to the map editor above, this route is an initial attempt at
    presenting a set of maps and their accompanying notes.
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
