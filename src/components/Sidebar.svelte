<script>
  import { SearchContainer, Ruleset, RulesetQueries } from './Search';
  export let val;
</script>

<div>
  <SearchContainer>
    <Ruleset>
      <RulesetQueries />
    </Ruleset>

  </SearchContainer>
</div>

<style>
  div {
    position: fixed;
    height: 100%;
    width: var(--sidebar-width);
    border-right: 1px solid #e1e4e8;
    padding: 15px;
    box-sizing: border-box;
    background: #fafbfc;
    overflow-y: scroll;
  }
</style>
