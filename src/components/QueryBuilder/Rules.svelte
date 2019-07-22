<script>
  export let selectionsActive = false;
</script>

<ul class="rules-container" class:compact={!selectionsActive}>
  <slot></slot>
</ul>


<style lang="less">
  .rules-container {
    display: flex;
    transition: 0.2s 0.2s;
    transform-origin: 0 100%;
    transform: translateY(30px);
    width: 100%;
    padding-bottom: 20px;
    overflow-x: scroll;
    list-style: none;

    &.compact {
      width: calc(100% - 500px);
    }
  }

</style>
