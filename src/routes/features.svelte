<script>
  import Youtube from '../components/Youtube.svelte';
  import { project_title } from '../config.js';
</script>

<svelte:head>
  <!-- TODO get the page title from a config /about -> "About" -->
  <title>{project_title} – Features</title>
</svelte:head>

<div class="container">
  <div class="copy">
    <h1>What can you do with this tool?</h1>

    <div class="feature">
      <h2>The workplace</h2>
      <p>
        HealthMosaic's workplace is divided into three main areas: the sidebar, the facet and the footer.
        The sidebar lets you control your exploration, the facet area gives you options for how to display your results, and the footer contains information about the tool such as the version number.
      </p>
      <Youtube
        height="450"
        id="UX5v_XfndpE"
        width="800"
      />
    </div>

    <div class="feature">
      <h2>Simple search</h2>
      <p>
        HealthMosaic has a simple search function that lets you enter single or multiple-word queries. You can also easily edit your query or restore your previous query.
      </p>
      <Youtube
        height="450"
        id="VyDTl_UAx0s"
        width="800"
      />
    </div>

    <div class="feature">
      <h2>The facets panel</h2>
      <p>
        HealthMosaic has multiple facets, each of which allows you to display your query in a different way.
        You can explore the geography of the results, as well as the terms that are used and information about funding. You can always refer to the list view to see what companies, research projects and social activities align with your search.
      </p>
      <Youtube
        height="450"
        id="9aVRbrKIzi8"
        width="800"
      />
    </div>

    <div class="feature">
      <h2>The tabs panel</h2>
      <p>
        HealthMosaic lets you have multiple tabs, so you can do multiple searches.
      </p>
      <Youtube
        height="450"
        id="U36EktrDZdI"
        width="800"
      />
    </div>

    <div class="feature">
      <h2>The selections</h2>
      <p>
        As you interact with the results of HealthMosaic, you can narrow the results by excluding certain terms or countries. Each time you do this, the list updates in the background.
      </p>
      <Youtube
        height="450"
        id="1BC5eB9bUAw"
        width="800"
      />
    </div>

    <div class="cta">
      <a href="search">
        <div class="button">
          <span>Try it now!</span>
        </div>
      </a>
    </div>
  </div>
</div>

<style lang="less">
  .container {
    width: 100%;
    height: 100%;
    padding: 2em;
    line-height: 2.5em;
    font-size: 1.1em;
    text-align: justify;
    color: var(--color-text);
    overflow-y: auto;
    grid-column: 2;
  }
  .copy {
    max-width: var(--size-copy-column-max-width);
    margin: auto;
  }

  h1 {
    text-align: left;
    font-size: 1.8em;
    font-weight: 700;
  }

  h2 {
    font-weight: 400;
    margin-top: 60px;
  }

  .cta {
    display: flex;
    align-items: center;
    justify-content: center;

    margin-top: 4em;
  }

  .button {
    font-size: 1.5em;
    border-radius: 8px 0 10px 0;
    background-color: var(--color-text);
    color: white;
    padding: 0.5em 0.8em;
  }
</style>
