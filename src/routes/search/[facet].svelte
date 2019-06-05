<script>
  import { stores } from '@sapper/app';
  import { onMount, tick } from 'svelte';
  import { machine } from '../../machines/screen_machine.ts';

  const { page } = stores();
    
  $: $page && machine.send({type: 'ROUTE_CHANGE_COMPLETED'})

</script>


<div class="content">

   <h1>{$page.params.facet}</h1>

</div>

