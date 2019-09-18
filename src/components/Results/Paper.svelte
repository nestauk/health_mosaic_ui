<script>
  import { createEventDispatcher } from 'svelte';
  import { format } from 'd3-format';
  import { Link } from '../Icons/';
  import { EyeIcon, EyeOffIcon } from 'svelte-feather-icons';
  import { countries } from '../../../data/geo/iso_a2_to_name_by_type.json';
  import { truncateText } from '../../util/string';

  import Tooltip from '../Tooltip.svelte';

  export let data;
  export let show = false;
  let hover = false;

  const dispatch = createEventDispatcher();

  export function close() {
    dispatch('hide');
  }

  export function open() {
    dispatch('show');
  }

  $: ({
    body,
    city,
    continent,
    cost_ref,
    countries_ids,
    country,
    end,
    id_source,
    name,
    sdg_labels,
    start,
    state,
    summary,
    terms,
    title,
    type,
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
    <p><strong>Summary: </strong>{truncateText(summary, show)}</p>
    {/if}

    {#if body}
        <strong>Body: </strong>
        {truncateText(body, show)}<br>
    {/if}
  </div>
  <div class="subject">
    <h2>{name}</h2>
    <p class="place">
      {place.join(', ')}
    </p>
    <div class="icon">
      <span on:mouseenter={() => hover = true} on:mouseleave={() => hover = false}>
        <a
          target="_blank"
          href="http://grantome.com/grant/NIH/{id_source}"
        >
          <img
            src="/logo_nih.png"
            alt="NIH Logo"
          />
        </a>
        {#if hover}
          <Tooltip offset="{-5}" text="The National Institute for Health"/>
        {/if}
      </span>
    </div>
    <div class="icon">
      <span
        class="more"
        on:click={() => show ? close() : open()}
      >
        {#if show}
          <EyeOffIcon />
        {:else}
          <EyeIcon />
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
      order: 1;
      border-right: 3px solid var(--color-type-paper);
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

    h2 {
      margin-bottom: 0.2em;
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
      margin: 10px 0;
      user-select: none;
    }
  }
</style>
