<script>
  export let selected;
</script>

<span class="selector" class:selected="{selected}">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      d="M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"
    />
    <path
      class="ondot"
      style="{selected ? 'opacity: 1; transform: scale(1)' : ''}"
      d="M363.5 148.5C334.8 119.8 296.6 104 256 104c-40.6 0-78.8 15.8-107.5 44.5C119.8 177.2 104 215.4 104 256s15.8 78.8 44.5 107.5C177.2 392.2 215.4 408 256 408c40.6 0 78.8-15.8 107.5-44.5C392.2 334.8 408 296.6 408 256s-15.8-78.8-44.5-107.5z"
    />
  </svg>
</span>

<style>
  span {
    width: 1.3rem;
    margin: 0 5px;
    display: flex;
    /* flex-direction: column; */
    justify-content: center;
    cursor: pointer;
    height: 2rem;
  }

  svg {
    width: 100%;
  }

  path {
    fill: #555;
  }

  .ondot {
    fill: #333;
    transform: scale(0);
    transition: 0.2s;
    transform-origin: 50% 50%;
    opacity: 0;
  }

  .selector:hover .ondot {
    opacity: 0.5;
    transform: scale(1);
  }

  .selected .ondot {
    opacity: 1;
    transform: scale(1);
  }

  .selector:hover .ondot {
    opacity: 0.5;
    transform: scale(1);
  }

  .selected .ondot {
    opacity: 1;
    transform: scale(1);
  }
</style>
