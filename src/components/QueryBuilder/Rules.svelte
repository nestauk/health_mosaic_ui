<script>
  import arrowForward from 'ionicons/dist/ionicons/svg/ios-arrow-forward.svg';
  export let selectionsActive = false;
  let width;

</script>

<svelte:window bind:innerWidth={width}/>

<div class="container">
  <div class="icon left">
    <img src={arrowForward} >
  </div>
  <ul
    class="rules-container"
    style="width:{selectionsActive ? '100%' : `${width - 600}px`}"
  >
    <slot></slot>
  </ul>
  <div class="icon right" style="right:{selectionsActive ? -30 : 470 }px">
    <img src={arrowForward} >
</div>
</div>

<style lang="less">
  .icon {
    height: 30px;
    position: absolute;
    height: 30px;
    top: 40px;
    position: absolute;
    bottom: 0;
    margin: auto;

    &.left {
      transform: rotate(180deg);
      left: -30px;
    }

    &.right {
      left: unset;
    }

    img {
      height: 100%;
    }
  }
  .container {
    position: relative;
    width: 100%;
  }
  .rules-container {
    display: flex;
    transition: 0.2s 0.2s;
    transform-origin: 0 100%;
    transform: translateY(30px);
    width: 100%;
    padding-bottom: 20px;
    overflow-x: scroll;
    list-style: none;

    /* &.compact {
      width: calc(100% - 500px);
    } */
  }

</style>
