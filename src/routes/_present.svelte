<script>
  import { throttle } from 'lamb';
  import { tick } from 'svelte';

  import { Mapbox } from '../components/Map';
  import { MAPBOXGL_STYLEURL, MAPBOXGL_ACCESSTOKEN } from '../config.js';

  import { createBoundsStore, createMemoStore } from '../stores';
  import { presentMachineConfig, presentMachineOptions } from '../machines/present';
  import { createMachina } from '../util/xstateHelper.ts';

  import { testMemos } from '../stores/fake_memos.js';

  const { machine: presentMachine, contextStores: { bounds, memo } } = createMachina(
    presentMachineConfig, presentMachineOptions, {
      bounds: createBoundsStore(testMemos.pins[0].bounds),
      memo: createMemoStore(testMemos)
    }
  );

  let container;
  let noteHeadings = [];
  let headerPosition = 0;
  let headerScale = 0.6;
  let transformPercent = 0;

  $: nextPin = $memo.currentPin + 1;
  $: prevPin = $memo.currentPin - 1;

  // triggers on scroll -- updates the header style values -- xstate action?
  function updateStyles(pin) {

    if (isNaN(pin)) return;
    const { top } = noteHeadings[pin].getBoundingClientRect();

    // headerPosition defines the translateY value of the h1
    // start value is 50 so it will gradually edge offscreen
    headerPosition = top - 50;

    // turning the current translate value into a percentage we can use as a base
    // we also need to make sure it isn't negative
    transformPercent = headerPosition >= 0 ? headerPosition / 80 : (headerPosition * -1) / 80;

    // only want to transition the scale between 0.6 and 1
    headerScale = 0.4 * transformPercent + 0.6;

    if ($presentMachine.matches('document.translateup') && headerPosition <= -80) {
      presentMachine.send({type:'TXEND', pin: nextPin});
      headerPosition = 1;
      transformPercent = 0;
      headerScale = 0.6;
    }

    if ($presentMachine.matches('document.translatedown') && headerPosition > 1) {
      presentMachine.send({type:'TXEND', pin: nextPin});
      headerPosition = 1;
      transformPercent = 0;
      headerScale = 0.6;
    }
  }

  let lastScrollPosition = 0;

  async function handleScroll({ target: { scrollTop, scrollHeight } }) {


    let newPinIndex;

    if (scrollTop < lastScrollPosition) {
      newPinIndex = calculateCurrentPinUp();

      if(newPinIndex !== false) {
        if (
          newPinIndex !== $memo.currentPin
          || (newPinIndex === $memo.currentPin
          && !$presentMachine.matches('document.translatedown'))
        ) {
          presentMachine.send({type: 'TRANSLATEDOWN', pin: newPinIndex });
        }
      };

    } else if (scrollTop > lastScrollPosition) {
      newPinIndex = calculateCurrentPinDown();

      if(newPinIndex !== false) {
        if (
          newPinIndex !== $memo.currentPin
          || (newPinIndex === $memo.currentPin
          && $presentMachine.matches('document.translateup'))
        ) {
          presentMachine.send({type: 'TRANSLATEUP', pin: newPinIndex });
        }
      };
    }

    await tick();

    if (
      $presentMachine.matches('document.translatedown')
      || $presentMachine.matches('document.translateup')
    ) {
      updateStyles(nextPin);
    }

    lastScrollPosition = scrollTop;
  }


  function calculateCurrentPinUp() {
    const { height, y: containerY } = container.getBoundingClientRect();

    const i = noteHeadings.findIndex((node, i, arr) => {
      const { y, bottom } = node.getBoundingClientRect();
      return y  >= -30 && bottom >=  50
    });

    return i-1 < 0  ? false: i-1;
  }

  function calculateCurrentPinDown() {
    const { height, y: containerY } = container.getBoundingClientRect();

    const i = noteHeadings.findIndex((node, i, arr) => {
      const { y, bottom } = node.getBoundingClientRect();
      return y  <= 50 && bottom >=  50;
    })

    return i === -1  ? false: i;
  }

  function calculateOpacity(txPercent, pinIndex) {
    if (pinIndex === $memo.currentPin) {
      return 1;
    }

    if (($presentMachine.matches('document.idle')) || pinIndex !== nextPin) {
      return 0.3
    }
    return txPercent * 0.7 + 0.3
  }

  const currentScale = (index, scale) =>
    nextPin === index
    && (
      $presentMachine.matches('document.translateup')
      || $presentMachine.matches('document.translatedown')
    )
    ? scale
    : 0.6;

  const throttledScroll = throttle(handleScroll, 10);
</script>

<div class="map-container">
    <Mapbox
    interactive={false}
    bounds="{$bounds}"
    apiKey="{MAPBOXGL_ACCESSTOKEN}"
    styleURL="{MAPBOXGL_STYLEURL}"
  />
</div>

<div on:scroll="{throttledScroll}"
     bind:this="{container}"
     class="text-container">

  <h1 style="transform: translateY({headerPosition}px)">
    {$memo.pins[$memo.currentPin||0].title}
  </h1>

  {#each $memo.pins as {title, description, id}, index }
    <div
      bind:this="{noteHeadings[index]}"
      style="opacity: {calculateOpacity(transformPercent, index)}"
      class="pin-container">
      <h2 style="transform: scale({currentScale(index, headerScale)})">
        {title}
      </h2>
      <span>
      {@html description}
      </span>
    </div>
  {/each}

</div>


<style>
  .map-container {
    height: calc(100vh);
    position: fixed;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 50%;
    border-right: 1px solid #ccc;
  }

  .text-container {
    height: calc(100vh - 80px);
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 50%;
    right: 0px;
    border-top: 1px solid #fff;
    overflow-y: scroll;
    padding-top: 50px;
  }

  h1 {
    margin-top: 50px;
    position: fixed;
    top: 0px;
    left: 50%;
    right: 0px;
    height: 70px;
    padding: 15px 50px;
    box-sizing: border-box;
    background: #fafafa;
    z-index: 2;
  }

  h1:first-of-type {
    margin: 0;
  }

  h2 {
    position: static;
    padding: 15px 0;
    font-size: 2em;
    height: 70px;
    transform-origin: 0% 00%;
    transform: scale(0.6);
  }

  span {
    display: block;
    margin-top: -50px;
  }

  .pin-container {
    padding: 30px 50px 0 50px;
  }

  .pin-container:first-of-type {
    margin-top: -50px;
  }

  .pin-container:last-child {
    min-height: 100vh;
  }

  :global(p) {
    margin: 30px 0;
  }

</style>
