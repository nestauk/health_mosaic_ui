<ul class="rules-container">
  <slot></slot>
</ul>


<style>
  .rules-container {
    display: flex;
    flex-wrap: wrap;
    transition: 0.2s 0.2s;
    transform-origin: 0 100%;
  }

  ul {
    list-style: none;
  }
</style>
