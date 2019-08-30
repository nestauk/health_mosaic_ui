<script>
  import { project_title } from '../config.js';
  import RouterLink from '../components/RouterLink.svelte';
</script>

<svelte:head>
  <title>{project_title} – Methodology</title>
</svelte:head>

<div class="container">
  <div class="copy">
    <h1>Methodology</h1>

    <h2>Data Enrichment</h2>

    <h3>Novelty Score</h3>
    <p>
      We have applied a novelty score to each entity in the three datasets to allow you to find innovative companies, research projects, and social activity. The novelty score we are currently using is a placeholder until the more robust version is applied in fall 2019.
    </p>
    <p>
      The current novelty score is defined as the “dissimilarity of a description from the most similar set of descriptions”. Technically, this is  calculated for each text description as follows:
    </p>
    <ul>
      <li>
        The twenty most descriptive terms (“words”) are identified in the document, defined according to the common “tf-idf” metric which determines important terms by their relative frequency in a given document with respect to all documents.
      </li>
      <li>
        The 1000 most similar documents are retrieved using, and are scored using tf-idf with respect to the target document. The total document score is normalised to the target document.
      </li>
      <li>
        Novelty is then defined as (1 - Q1), where Q1 is the 25th percentile of the distribution of the 1000 document scores.
      </li>
    </ul>

    <h3>MeSH Labels</h3>
    <p>
      <a href="https://meshb.nlm.nih.gov/treeView" target="_blank">
        <span class="highlight">Medical Subject Heading (MeSH)</span>
      </a>
      labels are a set of biomedical vocabulary that are compiled by the NIH’s
      <a href="https://www.nlm.nih.gov/" target="_blank">
        <span class="highlight">National Library of Medicine</span>
      </a>.
      By applying MeSH labels to all of the data in the tool, we have tried to identify common elements and simplify our ability to do analyses on these. The labelling is performed via an automated service provided by NIH, and replicates the results given by their
      <a href="https://meshb.nlm.nih.gov/MeSHonDemand" target="_blank">
        <span class="highlight">MeSH on Demand tool</span>
      </a>.
    </p>

    <h2>Source code</h2>
    <p>
      The source code used to collect the data can be found
      <a href="https://www.github.com/nestauk/nesta" target="_blank">
        <span class="highlight">here</span>
      </a>.
    </p>
    <p>
      The source code used to calculate the novelty score can be found
      <a href="https://www.github.com/nestauk/rhodonite" target="_blank">
        <span class="highlight">here</span>
      </a>.
    </p>
    <p>
      The source code of this website can be found
      <a href="https://www.github.com/nestauk/{project_title}_ui" target="_blank">
        <span class="highlight">here</span>
      </a>.
    </p>

    <h2>Glossary</h2>

    <h3>MeSH Labels</h3>

    <p>
      Medical Subject Heading (MeSH) Labels are a set of biomedical vocabulary that are compiled by the NIH’s National Library of Medicine.
    </p>
    <p>
      ... (to be continued)
    </p>
  </div>
  <div class="cta">
    <RouterLink href="features">
      <div class="button">
        <span>Learn the tool!</span>
      </div>
    </RouterLink>
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
  h3 {
    font-weight: 400;
    margin-top: 40px;
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

  ul {
    padding-left: 2em;
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
