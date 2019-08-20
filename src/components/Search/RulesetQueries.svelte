<script>
  import { Edit } from '../Icons';
  export let isEditing = true;
</script>

<div class="input">
  <input />
  <button><Edit /></button>
</div>

<style lang="less">
  .input {
    display: flex;
    justify-content: space-between;

    button {
      padding: 0;
      width: 30px;
      height: 30px;
      border: none;
      cursor: pointer;
      color: #999;
      &:inactive {
        opacity: 0.6;
      }

      &:hover {
        color: #333;
      }
    }
  }

  input {
    outline: none;
    border: none;
    border-bottom: var(--button-border);
    font-size: 16px;
    width: 100%;
    background: none;
    padding: 5px;
    margin: 0 20px 15px 0;

    &:focus {
      border-color: #333;
    }
  }
</style>
