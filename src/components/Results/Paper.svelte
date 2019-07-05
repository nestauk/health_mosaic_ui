<script>
  import { format } from 'd3-format';
  import { AddCircle, RemoveCircle } from '../Icons/'
  import { countries } from '../../../data/geo/iso_a2_to_name_by_type.json';

  export let data;
  let show = false;

  $: ({
    body,
    city,
    continent,
    cost_ref,
    countries_ids,
    country,
    end,
    name,
    sdg_labels,
    start,
    state,
    summary,
    terms,
    title,
    type,
    url,
  } = data)
  $: remainingValues = [
    ['Received', 'USD ' + format('.2s')(cost_ref)],
    ['Terms', terms && terms.join(' • ')],
    ['Mentioned Countries', countries_ids && countries_ids.map(v => countries[v]).join(' • ')],
    ['Sustainable Development Goals', sdg_labels && sdg_labels.join(' • ')]
  ].filter(([name, value]) => !!value)
  $: place = [city, state, country, continent].filter(Boolean);
</script>

<article>
  <div class="content">
    <h2>{title}</h2>
    <ul>
      <li><strong>Start:</strong> {start} <strong>End:</strong> {end}</li>
      {#each remainingValues as [name, value]}
        <li><strong>{name}:</strong> {value}</li>
      {/each}
    </ul>
    {#if summary}
    <p><strong>Summary:</strong>{summary}</p>
    {/if}

    {#if body}
      <span
        class="more"
        on:click={() => show = !show}
      >
        {#if show}
          <RemoveCircle color='#333' />
        {:else}
          <AddCircle color='#333' />
        {/if}
      </span>
    {/if}

    {#if body}
      {#if show}
        <strong>Description</strong>
        {body}<br>
      {/if}
    {/if}
  </div>
  <div class="subject">
    <h2>{name}</h2>
    <p class="place">
      {place.join(', ')}
    </p>
  </div>
</article>

<style lang="less">
  article {
    width: 100%;
    margin-bottom: 3em;

    display: flex;

    .content {
      flex: 4;
      order: 2;
      padding: 0.5em 1em;

      ul {
        list-style: none;
      }
    }

    .subject {
      flex: 1;
      order: 1;
      border-right: 3px solid #2f98f3;
      padding: 0.5em 1em;
      text-align: right;
    }

    h2 {
      margin-bottom: 0.2em;
    }
    h3 {
      font-size: 1em;
      margin-top: 0;
      margin-bottom: 0.5em;
      text-align: right;
    }
    .place {
      margin-bottom: 1em;
      font-style: italic;
      text-align: right;
    }

    .more {
      cursor: pointer;
      display: block;
      width: 30px;
      margin-left: 10px 0;
      user-select: none;
    }
  }
</style>
