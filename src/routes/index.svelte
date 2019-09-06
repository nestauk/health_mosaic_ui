<script>
  import { project_title } from '../config.js';
  import RouterLink from '../components/RouterLink.svelte';
</script>

<svelte:head>
  <!-- TODO get the page title from a config /about -> "About" -->
  <title>{project_title} – About</title>
</svelte:head>

<div class="container">
  <div class="copy">
    <h1>About</h1>

    <h2>What</h2>
    <p>
      {project_title} is a free, open tool that can be used by anyone to explore key dimensions of the health innovation ecosystem, including research, startups and social activity. We aim to shed light on hidden innovations by bringing together previously siloed datasets, cutting edge data science techniques, and interactive visualisations into a platform that can be accessed by anyone, anywhere.
    </p>

    <h2>Who</h2>
    <p>
      This project has been carried out by
      <a href="https://www.nesta.org.uk/project/innovation-mapping/" target="_blank">
        <span class="highlight">Nesta’s Innovation Mapping team</span>
      </a>
      in collaboration with
      <a href="https://www.nesta.org.uk/health" target="_blank">
        <span class="highlight">Nesta Health Lab</span>
      </a>.
      <a href="https://www.nesta.org.uk/" target="_blank">
        <span class="highlight">Nesta</span>
      </a>
      is a registered charity in England and Wales 1144091 and Scotland SC042833.
    </p>
    <p>
      The project was supported by a generous grant from the
      <a href="https://www.rwjf.org/" target="_blank">
        <span class="highlight">Robert Wood Johnson Foundation</span>
      </a>,
      administered by
      <a href="https://www.cafonline.org/" target="_blank">
        <span class="highlight">CAF International</span>
      </a>.
    </p>
    <p>
      We are also grateful for the wide variety of people and organisations provided feedback and input along the way, particularly those who kindly volunteered their time to participate in user testing.
    </p>
    <p>
      We would also like to thank the
      <a href="https://foundation.mozilla.org/opportunity/mozilla-open-leaders/" target="_blank">
        <span class="highlight">Mozilla Open Leaders programme</span>
      </a>
      for working with members of our team to develop open working practices.
    </p>

    <h2>Why</h2>
    <p>
      The world is full of innovative people, projects, evidence, and organisations with vast potential to improve our collective health and wellbeing. Much of this potential remains untapped or underutilised, however, as these ideas and innovations never leave the place they were created. This project aims to take a first step toward bringing those innovations out of the shadows, allowing them to move across borders and contexts
    </p>
  </div>

  <div class="cta">
    <RouterLink href="data">
      <div class="button">
        <span>Read more about the data sources</span>
      </div>
    </RouterLink>
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
