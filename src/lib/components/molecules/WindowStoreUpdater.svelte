<script lang="ts">

  /**
   * ! lorem
  */



  //- stores
  import { width } from "$stores/windowStore";

  //- prop
  export let w = 0;

  //- reactive expressions
  $: { $width = w; }

</script>

<svelte:window bind:innerWidth={w}/>
