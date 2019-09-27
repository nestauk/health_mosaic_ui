<script>
  import HistogramSVG from './HistogramSVG.svelte';

  // html
  export let title;

  // svg
  export let bins;
  export let colors;
  export let interactive = false;
  export let orientation_x = 'left-right';
  export let orientation_y = 'bottom-up';
  export let selectedKeys = [];

  $: isRightToLeft = orientation_x === 'right-left';

  let height = 0;
  let width = 0;
</script>

<div
  class="histogram"
  class:interactive
>
  {#if title}
  <header class:rightToLeft="{isRightToLeft}">
    <p>{title}</p>
  </header>
  {/if}
  <main
    bind:clientWidth="{width}"
    bind:clientHeight="{height}"
    class:titled="{title && title.length}"
  >
    <svg
      {width}
      {height}
    >
      <HistogramSVG
        {bins}
        {colors}
        {height}
        {interactive}
        on:clickedBin
        {orientation_x}
        {orientation_y}
        {selectedKeys}
        {width}
      />
    </svg>
  </main>
</div>

<style lang="less">
  .histogram {
    width: 100%;
    height: 100%;

    @header-height: 2em;

    pointer-events: none;
    &.interactive {
      pointer-events: auto;
    }

    header {
      width: 100%;
      height: @header-height;

      display: flex;
      align-items: center;

      &.rightToLeft {
        justify-content: flex-end;
      }

      p {
        font-size: 0.9em;
      }
    }

    main {
      width: 100%;
      height: 100%;
      user-select: none;

      &.titled {
        height: calc(100% - @header-height);
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
