<script>
  import { format } from 'd3-format';
  import { Link, AddCircle, RemoveCircle } from '../Icons/'
  import { countries } from '../../../data/geo/iso_a2_to_name_by_type.json';

  import Tooltip from '../Tooltip.svelte';

  export let data;
  let show = false;
  let hover = false;

  export function close() {
    show = false;
  }

  export function open() {
    show = true;
  }

  $: ({
    body,
    city,
    continent,
    cost_ref,
    countries_ids,
    country,
    end,
    funders,
    name,
    sdg_labels,
    start,
    state,
    summary,
    terms,
    title,
    type,
    url,
    url_source
  } = data)

  $: remainingValues = [
    ['Received', 'USD ' +format('.2s')(cost_ref)],
    ['From', funders && funders.join(' • ')],
    ['Terms', terms && terms.join(' • ')],
    ['Mentioned Countries', countries_ids && countries_ids.map(v => countries[v]).join(' • ')],
    ['Sustainable Development Goals', sdg_labels && sdg_labels.join(' • ')]
  ].filter(([name, value]) => !!value)
  $: place = [city, state, country, continent].filter(Boolean);
</script>

<article>
  <div class="content">
    <ul>
      <li>
        <strong>Start:</strong> {start}
        {#if end}
          <strong>End:</strong> {end}
        {/if}
      </li>
      {#each remainingValues as [name, value]}
        <li><strong>{name}:</strong> {value}</li>
      {/each}
    </ul>

    {#if summary}
      <p><strong>Summary: </strong>{summary}</p>
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
    <h2>
      {name}
    </h2>
    <p>
      {place.join(', ')}
    </p>
    <div class="icon">
      {#if url}
      <span>
        <a
          target="_blank"
          href="{url}"
        >
          <Link color='#aaa'/>
        </a>
      </span>
      {/if}
      <span
        on:mouseenter={() => hover = true}
        on:mouseleave={() => hover = false}
      >
        {#if url_source}
        <a
          target="_blank"
          href="{url_source}"
        >
          <img
            src="/logo_cb.jpg"
            alt="Crunchbase logo"
          />
        </a>
        {#if hover}
          <Tooltip offset="{-5}" text="Crunchbase"/>
        {/if}
        {/if}
      </span>
    </div>
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
        padding: 0;
      }
    }

    .subject {
      flex: 1;
      min-width: 12em;
      order: 1;
      border-right: 3px solid var(--color-type-company);
      padding: 0.5em 1em;
      text-align: right;
      max-width: 20em;
      overflow-wrap: break-word;

      .icon {
        display: flex;
        justify-content: flex-end;

        span {
          width: 28px;
          transform: translateY(5px);
          margin-left: 10px;

          img {
            width: 100%;
            transform: translateY(2px);
          }
        }
      }
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
