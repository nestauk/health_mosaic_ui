<script>
  import Footer from '../components/Footer.svelte';
  import Header from '../components/Header.svelte';
</script>

<header>
  <Header/>
</header>
<main>
  <slot></slot>
</main>
<footer>
  <Footer/>
</footer>

<style lang="less">
  /* TODO use a grid */
  header {
    width: 100%;
    height: var(--size-header-height);
  }
  main {
    position: relative;
    width: 100%;
    height: var(--size-main-height);
    margin: 0;

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
    height: var(--size-footer-height);
  }
</style>
