<script>
  import { project_title } from '../config.js';
  import RouterLink from '../components/RouterLink.svelte';
  import Youtube from '../components/Youtube.svelte';
</script>

<svelte:head>
  <title>{project_title} – Features</title>
</svelte:head>

<div class="container">
  <div class="copy">
    <h1>What can you do with this tool?</h1>

    <div class="feature">
      <h2>A simple search</h2>
      <p>
        is a free, open tool that can be used by anyone to explore key dimensions of the health innovation ecosystem, including research, startups and social activity. We aim to shed light on hidden innovations by bringing together previously siloed datasets, cutting edge data science techniques, and interactive visualisations into a platform that can be accessed by anyone, anywhere.
      </p>
      <Youtube id="M5JFeTtSS3c" />
    </div>

    <div class="feature">
      <h2>A more advanced search</h2>
      <p>
        is a free, open tool that can be used by anyone to explore key dimensions of the health innovation ecosystem, including research, startups and social activity. We aim to shed light on hidden innovations by bringing together previously siloed datasets, cutting edge data science techniques, and interactive visualisations into a platform that can be accessed by anyone, anywhere.
      </p>
      <Youtube id="OiuQ_rVM-WE" />
    </div>
    <div class="feature">
      <h2>Select results in the countries of your interest</h2>
      <p>
        is a free, open tool that can be used by anyone to explore key dimensions of the health innovation ecosystem, including research, startups and social activity. We aim to shed light on hidden innovations by bringing together previously siloed datasets, cutting edge data science techniques, and interactive visualisations into a platform that can be accessed by anyone, anywhere.
      </p>
      <Youtube id="4Pnv8m4FF-k" />
    </div>

    <div class="feature">
      <h2>Navigate the terms </h2>
      <p>
        is a free, open tool that can be used by anyone to explore key dimensions of the health innovation ecosystem, including research, startups and social activity. We aim to shed light on hidden innovations by bringing together previously siloed datasets, cutting edge data science techniques, and interactive visualisations into a platform that can be accessed by anyone, anywhere.
      </p>
      <Youtube id="vl-PcTA9HHg" />
    </div>

    <div class="cta">
      <RouterLink href="search">
        <div class="button">
          <span>Try it now!</span>
        </div>
      </RouterLink>
    </div>
  </div>

</div>

<style lang="less">
  @import '../styles/mixins.less';

  .container {
    width: 100%;
    height: 100%;
    padding: 2em;
    line-height: 2.5em;
    font-size: 1.1em;
    text-align: justify;
    color: var(--color-text);
    overflow-y: auto;
  }
  .copy {
    max-width: 800px;
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

  a {
    text-decoration: none;
    display: inline-block;
  }

  span {
    &.highlight {
      .highlighted();
    }
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
