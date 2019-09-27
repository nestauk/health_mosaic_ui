<script>
  import { format } from 'd3-format';
  import { createEventDispatcher } from 'svelte';
  import { EyeIcon, EyeOffIcon } from 'svelte-feather-icons';

  import { countries } from '../../../data/geo/iso_a2_to_name_by_type.json';
  import { typeNames } from '../../config';
  import { truncateText } from '../../util/string';
  import { Link } from '../Icons/';
  import Tooltip from '../Tooltip.svelte';

  const dispatch = createEventDispatcher();

  export let data;
  export let show = false;

  export function close() {
    dispatch('hide');
  }

  export function open() {
    dispatch('show');
  }

  let hover = false;

  $: ({
    body,
    city,
    continent,
    cost_ref,
    countries_ids,
    country,
    end,
    funders,
    id_source,
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
    cost_ref ? ['Received', 'USD ' +format('.2s')(cost_ref)] : [],
    ['From', funders && funders.join(' • ')],
    ['Terms', terms && terms.join(' • ')],
    ['Mentioned Countries', countries_ids && countries_ids.map(v => countries[v]).join(' • ')],
    ['Sustainable Development Goals', sdg_labels && sdg_labels.join(' • ')]
  ].filter(([name, value]) => !!value)
  $: place = [city, state, country, continent].filter(Boolean);
</script>

<article>
  <div class="content">
    {#if type === 'paper'}
      <h2>{title}</h2>
    {/if}
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
      <p>
        <strong>Summary: </strong>
        {show ?  summary : truncateText(summary)}
      </p>
    {/if}

    {#if body}
      <p>
        <strong>Body: </strong>
        {show ? body : truncateText(body)}
      </p>
    {/if}
  </div>
  <div class="subject {type}">
    <h2>
      {name}
    </h2>
    <p>
      {place.join(', ')}
    </p>
    <div class="icon">
      {#if url && type === 'company'}
      <span class="website">
        <a
          target="_blank"
          href="{url}"
        >
          <Link color="hsl(0, 0%, 20%)"/>
        </a>
      </span>
      {/if}
      <span
        on:mouseenter="{() => hover = true}"
        on:mouseleave="{() => hover = false}"
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
        {:else if url}
          <a
            target="_blank"
            href="{url}"
          >
            <img
              src="/logo_meetup.svg"
              alt="Meetup Logo"
            />
          </a>
        {:else}
          <a
            target="_blank"
            href="http://grantome.com/grant/NIH/{id_source}"
          >
            <img
              src="/logo_nih.png"
              alt="NIH Logo"
            />
          </a>

        {/if}
        {#if hover}
          <Tooltip offset="{["-5px", "0"]}" text="{typeNames[type]}"/>
        {/if}
      </span>
    </div>
    <div class="icon">
      <span
        class="folding"
        on:click="{() => show ? close() : open()}"
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
      min-width: 12em;
      order: 1;
      padding: 0.5em 1em;
      text-align: right;
      max-width: 20em;
      overflow-wrap: break-word;

      &.company {
        border-right: 3px solid var(--color-type-company);
      }

      &.paper {
        border-right: 3px solid var(--color-type-paper);
      }

      &.meetup {
        border-right: 3px solid var(--color-type-event);
      }

      .icon {
        display: flex;
        justify-content: flex-end;

        span {
          width: 28px;
          transform: translateY(5px);
          margin-left: 10px;

          &.website {
            opacity: 0.6;

            &:hover {
              opacity: 1;
            }
          }

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

    p:last-child {
      margin: 0;
    }

    .folding {
      cursor: pointer;
      display: block;
      width: 30px;
      margin: 10px 0;
      user-select: none;
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
