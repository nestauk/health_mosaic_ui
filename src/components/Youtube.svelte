<script>
  export let id;
  export let title = 'Youtube video';
</script>

<div class="youtube">
  <iframe
    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    frameborder="0"
    height="315"
    src="https://www.youtube.com/embed/{id}"
    {title}
    width="560"
  ></iframe>
</div>

<style lang="less">
  .youtube {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
