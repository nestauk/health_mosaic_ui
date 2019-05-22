<script>
  export let value, isActive, ruleSelect;
</script>

<li class:active-query="{isActive}" class="rule" on:click="{ruleSelect}">
  <slot></slot>
</li>

<style>
  .rule {
    /* border-bottom: 1px solid #ccc; */
    /* padding: 10px; */
    font-size: 18px;
    position: relative;
    display: flex;
    height: 3.4rem;
    border: 1px solid #ccc;
    margin: 10px;
    border-radius: 1.7rem;
    padding-left: 3.4rem;
    transition: 0.2s;
  }

  .rule::before {
    position: absolute;
    content: '';
    height: 3.4rem;
    width: 2.5rem;
    top: -1px;
    left: -1px;
    background: #ccc;
    border-top-left-radius: 1.7rem;
    border-bottom-left-radius: 1.7rem;
    transition: 0.2s;

    /* border: 1px solid #333; */
    /* border-radius: 1.7rem; */
  }

  .rule.active-query {
    border-color: #333;
  }
  .rule.active-query::before {
    background: #333;
    border-color: #333;
  }
</style>
