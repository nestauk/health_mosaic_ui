<script>
  import { arrayMaxBy } from '@svizzle/utils';
  import { scaleLinear } from 'd3-scale';

  const maxByValue = arrayMaxBy('value');

  export let items;
  export let labels;
  export let title;

  let width;

  $: max = maxByValue(items);
  $: scale = scaleLinear().domain([0, max]).range([0, 100]);
  $: bars = items.map(item => ({
    ...item,
    barStyle: { width: scale(item.value) },
  }));

</script>

<div class="container">
  {#if title}
  <header>
    <h3>{title}</h3>
  </header>
  {/if}
  <main>
    {#each bars as {barStyle, key, value} (key)}
    <div class="item">
      <div class="labels">
        <span>{labels ? labels[key] : key}</span>
        <span>{value}</span>
      </div>
      <div class="bar" style="width: {barStyle.width}%"></div>
    </div>
    {/each}
  </main>
</div>

<style lang="less">
  .container {
    @header-height: 2em;

    width: 100%;
    height: 100%;
    padding: 10px;

    header {
      width: 100%;
      height: @header-height;

      display: flex;
      align-items: center;
    }

    main {
      width: 100%;
      height: calc(100% - @header-height);
      max-height: calc(100% - @header-height);
      overflow-y: auto;
      padding-right: 5px;

      .item {
        padding: 0.5em 0;

        .labels {
          line-height: 1em;
          padding: 0;
          margin: 0;
          color: grey;
          font-size: 0.9em;
          padding-bottom: 0.15em;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bar {
          height: 4px;
          background-color: black;
        }
      }
    }
  }
</style>
