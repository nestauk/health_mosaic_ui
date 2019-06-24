<script>
  export let disabled;
</script>

<svg
  class="{disabled ? 'off' : 'on'}"
  width="100%"
  height="100%"
  viewBox="0 0 448 256"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xml:space="preserve"
  xmlns:serif="http://www.serif.com/"
  style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"
>
  <path
    d="M448,128C448,57.355 390.645,0 320,0L128,0C57.355,0 0,57.355 0,128C0,198.645 57.355,256 128,256L320,256C390.645,256 448,198.645 448,128Z"
  />
  <path
    d="M320.153,80C346.62,80 368.153,101.533 368.153,128C368.153,154.467 346.62,176 320.153,176C293.686,176 272.153,154.467 272.153,128C272.153,101.533 293.686,80 320.153,80M320.153,48C275.97,48 240.153,83.817 240.153,128C240.153,172.183 275.97,208 320.153,208C364.336,208 400.153,172.183 400.153,128C400.153,83.817 364.336,48 320.153,48Z"
    style="fill-rule:nonzero;"
  />
  <path
    d="M320,32C372.934,32 416,75.065 416,128C416,180.935 372.934,224 320,224L128,224C75.065,224 32,180.935 32,128C32,75.065 75.065,32 128,32L320,32M320,0L128,0C57.308,0 0,57.308 0,128C0,198.692 57.308,256 128,256L320,256C390.692,256 448,198.692 448,128C448,57.308 390.692,0 320,0Z"
    style="fill-rule:nonzero;"
  />
</svg>

<style>
  svg {
    height: 100%;
  }
  path {
    transition: 0.3s;
  }

  .off path:nth-of-type(1) {
    fill: #fff;
  }
  .off path:nth-of-type(2) {
    fill: #555;
    transform: translateX(-190px);
  }
  .off path:nth-of-type(3) {
    fill: #555;
  }

  .on path:nth-of-type(1) {
    fill: #555;
  }

  .on path:nth-of-type(2) {
    fill: #fff;
  }
  .on path:nth-of-type(3) {
    fill: #555;
  }
</style>
