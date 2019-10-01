<script>
  export let text = '';
  export let show = false;
</script>

<span class="StatusBar">
  {#if text && show}
    <span>
      {text}
    </span>
  {/if}
</span>

<style lang="less">
  .StatusBar {
    height: 2rem;
    text-align: center;
    margin: 10px 0 5px 0;

    span {
      display: inline-block;
      padding: 2px 5px;
      background: #333;
      border-radius: 2px;
      color: #eee;
      font-size: 14px;
      text-align: center;
    }
  }
</style>
