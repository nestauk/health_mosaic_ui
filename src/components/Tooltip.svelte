<script>
  import { makeStyle } from '@svizzle/dom';

  export let maxWidth = '10vw';
  export let prefix = '';
  export let text = '';
  export let x = 0;
  export let y = 0;
  export let width = '200px';

  $: style = makeStyle({
    transform: `translate(${x},${y})`,
    width,
    'max-width': maxWidth
  });
</script>

<span {style}>
  {prefix} {text}
</span>

<style>
  span {
    position: absolute;
    padding: 2px 5px;
    background: #333;
    border-radius: 2px;
    color: #eee;
    width: 200px;
    font-size: 14px;
    text-align: center;
    right: 0;
    top: 42px;
    max-width: 10vw;
    z-index: var(--z-index-menu);
  }

  span::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 5px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #333;
  }
</style>
