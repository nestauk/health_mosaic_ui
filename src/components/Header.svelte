<script>
  import RouterLink from '../components/RouterLink.svelte';
</script>

<div class="container">
  <RouterLink href="">
    <div class="home">
      <img src="logo_mosaic_512.png"/>
      <span>HealthMosaic</span>
    </div>
  </RouterLink>
  <div class="group">
    <RouterLink href="about">
      <div class="text">
        <span>About</span>
      </div>
    </RouterLink>
    <RouterLink href="data">
      <div class="text">
        <span>Data</span>
      </div>
    </RouterLink>
    <RouterLink href="methodology">
      <div class="text">
        <span>Methodology</span>
      </div>
    </RouterLink>
    <RouterLink href="features">
      <div class="text">
        <span>Learn</span>
      </div>
    </RouterLink>
    <RouterLink href="search">
      <div class="button">
        <span>Search</span>
      </div>
    </RouterLink>
  </div>
</div>

<style lang="less">
  .container {
    width: 100%;
    height: 100%;
    border-bottom: 1px solid lightgrey;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--size-bars-padding) calc(2 * var(--size-bars-padding));

    .home {
      height: 100%;
      display: flex;
      align-items: center;

      img {
        width: var(--size-header-innerheight);
        height: var(--size-header-innerheight);
        border-radius: calc(var(--size-header-innerheight) / 2);
        margin-right: var(--size-bars-padding);
      }
      span {
        font-size: 1.3em;
        font-weight: 300;
        color: var(--color-text);
      }
    }

    .group {
      display: flex;
      align-items: center;
    }
    .button {
      border-radius: 8px 0 10px 0;
      background-color: var(--color-text);
      color: white;
      padding: 0.5em 0.8em;
    }
    .text {
      font-weight: 500;
      color: var(--color-text);
      padding: 0.6em;
    }
    .button,
    .text {
      margin-left: 1em;
    }
  }
</style>
