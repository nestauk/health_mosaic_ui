<script>
  export let height = 315;
  export let id;
  export let isPlaylist = false;
  export let title = 'Youtube video';
  export let width = 560;

  const embedBase = `https://www.youtube.com/embed/`;

  $: src = isPlaylist
    ? embedBase + 'videoseries?list=' + id + '&cc_load_policy=1'
    : embedBase + id + '?cc_load_policy=1';
</script>

<div class="youtube">
  <iframe
    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    frameborder="0"
    {height}
    {src}
    {title}
    {width}
  ></iframe>
</div>

<style>
  .youtube {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
