<script>
  import Footer from '../components/Footer.svelte';
  import Header from '../components/Header.svelte';
  import { widthBreakpoints } from '../config';
  import {
    makeMatchingMqStore,
    registerBreakpoints
  } from '../util/mediaqueries';

  const matchingMqStore =
    registerBreakpoints(widthBreakpoints, makeMatchingMqStore);
</script>

<div class="AppLayout">
  <header>
    <Header {matchingMqStore} />
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <Footer/>
  </footer>
</div>

<style lang="less">
  .AppLayout {
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-rows:
      var(--size-header-height)
      var(--size-main-height)
      var(--size-footer-height);
    grid-template-columns: 100%;
  }
  header {
    width: 100%;
    grid-row: 1 / span 1;
  }
  main {
    width: 100%;
    grid-row: 2 / span 1;

    margin: 0;
    position: relative;

    &::before {
      display: block;
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      background-image: url(/voronoi.svg);
      background-size: cover;
      background-position: center;
      height: 100%;
      width: 100%;
      opacity: 0.7;
      z-index: -100;
    }
  }
  footer {
    width: 100%;
    grid-row: 3 / span 1;
  }
</style>
