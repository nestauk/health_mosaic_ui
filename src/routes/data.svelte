<script>
  import { project_title } from '../config.js';
  import RouterLink from '../components/RouterLink.svelte';
</script>

<svelte:head>
  <!-- TODO get the page title from a config /about -> "About" -->
  <title>{project_title} – Data</title>
</svelte:head>

<div class="container">
  <div class="copy">
    <h1>Data</h1>

    <p>
      We explored lots of different datasets for this project, ultimately landing on three to include in the prototype version. We chose these datasets because they each cover a key component of the innovation ecosystem and provide a relatively global level of coverage of activity. This is not to say these datasets perfectly capture health innovation activity at any given place or time, so it is important that any inferences drawn from analyses performed in the { project_title } take into account the limitations of each dataset.
    </p>

    <h2>Companies</h2>
    <p>
      Companies play a key role in the innovation ecosystem by creating and offering new products and services that can solve problems and boost economic productivity.
    </p>
    <p>
      The company data in the {project_title} is licensed from
      <a href="https://www.crunchbase.com/" target="_blank">
        <span class="highlight">Crunchbase</span>
      </a>,
      which is a platform that contains business information on private and public companies with particularly good coverage of the tech industry and startups. A key strength of Crunchbase is its global coverage, containing details on companies in over 200 countries. We have only included companies which are active in health as determined by training a machine learning model (“random forest”) based on labels provided in the Crunchbase data.
    </p>

    <h2>Social</h2>
    <p>
      Exploring patterns of social activity can provide some insight into where people are meeting informally to exchange ideas, make new connections and gain new skills - all of which are crucial for developing and spreading innovative ideas.
    </p>
    <p>
      The social data in the {project_title} is from the online service
      <a href="https://www.meetup.com/" target="_blank">
        <span class="highlight">Meetup</span>
      </a>, which is used by people around the world to organise in-person events on almost any topic you can think of. We obtained the Meetup data using their API, and only collected data for the United States, Canada, Europe and India and for Meetup groups that were formed before May 2019.
    </p>

    <h2>Research</h2>
    <p>
      The generation of new knowledge through research activities, as well as the training of research staff that goes alongside these activities, are key drivers of innovation.
    </p>
    <p>
      The research data in the {project_title} is the
      <a href="https://worldreport.nih.gov/app/#!/" target="_blank">
        <span class="highlight">National Institutes of Health’s World RePORT</span>
      </a>
      dataset. This is an open dataset that can be downloaded from their website. It brings together details on global biomedical research investments and partnerships across 10 key funding organisations (including the UK’s Medical Research Council, the European Commission, and the US National Institutes of Health).
    </p>
  </div>

  <div class="cta">
    <RouterLink href="methodology">
      <div class="button">
        <span>Read more about our methodology</span>
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
