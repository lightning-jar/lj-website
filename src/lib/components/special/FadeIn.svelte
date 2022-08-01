<script lang='ts'>

// svelte
import { fade } from "svelte/transition";
import { onMount } from "svelte";

// props
export let delay = 10;
export let duration = 200;

// variables
let loadNow = false;

onMount(()=> {
   loadNow = true;
})


</script>

<template lang='pug'>

+if('loadNow')
  span(transition:fade!="{{delay:delay, duration:duration}}")
    slot

</template>