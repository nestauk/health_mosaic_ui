<script>
import { createEventDispatcher } from 'svelte';
import { capitalise } from '../../util/string'

export let indices;
export let isQueries;
export let index;
const dispatch = createEventDispatcher();

</script>

<div style="right: {isQueries ? 170 : 30}px">
	<select
		bind:value={index}
		on:change={() =>
		dispatch('indexchange', index.toLowerCase())}
	>
		{#each indices as index}
			<option value="{index}">{capitalise(index)}</option>
		{/each}
	</select>
</div>

<style>
div {
	margin: 15px 0;
	position: absolute;
	bottom: 5px;
	z-index: 2;
}

div::after {
	content: ' ';
	width: 34px;
	height: 34px;
	right: 1px;
	top: 1px;
	background: #fff url('../arrow.svg') no-repeat center 50%/60%;
	position: absolute;
	z-index: 2;
	pointer-events: none;
}

select {
	height: 36px;
	padding: 0 15px 0 2px;
	border-radius: 2px;
	border: 1px solid #ddd;
	font-size: 16px;
	color: #333;
	position: relative;
}

select:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #333;
}

option:not(:checked) {
  color: #333;
}
</style>