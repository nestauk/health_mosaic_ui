<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let current;
  export let values;

  $: toggle = current;

  function toggleSelection() {
    toggle = toggle === values[0] ? values[1] : values[0];
  }

  $: dispatch('toggle', toggle);
</script>

<fieldset role="radiogroup" >
  <div class="c-toggle">
    <label for="one" class:active={toggle === values[0]}>{values[0]}</label>
    <span class="c-toggle__wrapper">
      <input type="radio" name="theme" id="one" bind:group={toggle} value="{values[0]}">
      <input type="radio" name="theme" id="two" bind:group={toggle} value="{values[1]}">
      <span aria-hidden="true" class="c-toggle__background" on:click={toggleSelection}></span>
      <span aria-hidden="true" class="c-toggle__switcher" on:click={toggleSelection}></span>
    </span>
    <label for="two" class:active={toggle === values[1]}>{values[1]}</label>
  </div>
</fieldset>

<style lang="less">
.c-toggle {
  cursor: pointer;

  label {
    font-size: 16px;
    margin: 0 .5em 0;
    opacity: 0.6;
    cursor: pointer;

    &.active {
      opacity: 1;
    }
  }

  input[type="radio"] {
    display: inline-block;
    margin-right: -2px;
    width: 50%;
    height: 100%;
    opacity: 0;
    position: relative;
    z-index: 1;
    cursor: pointer;
  }
}

.c-toggle__wrapper {
  font-size: var(--baseSize); /* FIXME this var doesn't exist */
  display: inline-block;
  vertical-align: middle;
  width: 4em;
  height: 2em;
  border-radius: 3.5em;
  border: 1px solid #ddd;
  position: relative;
}
.c-toggle__switcher {
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	right: 100%;
	width: 50%;
	height: 100%;
	border-radius: 50%;
	border: 1px solid #bbb;
	transition: all 0.2s ease-out;
	z-index: 2;
  background: #ccc;
}

.c-toggle__background {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border-radius: 2em;
  background-color: #fff;
  transition: all 0.2s ease-out;
  cursor: pointer;
}

#two:checked ~ .c-toggle__switcher {
	right: 0;
	left: 50%;
}

#two:checked ~ .c-toggle__background {
  background-color: #fff;
}

fieldset {
	border: none;
	user-select: none;
	width: 12em;
  padding: 0;
}

</style>
