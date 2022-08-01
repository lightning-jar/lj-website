<script lang='ts'>

// svelte
import { fly } from "svelte/transition";
import { onMount } from "svelte";

// props
export let delay = 200;
export let duration = 200;
export let y = 1000;

// variables
let loadNow = false;

onMount(()=> {
   loadNow = true;
})


</script>

<template lang='pug'>

+if('loadNow')
  span(transition:fly!="{{delay:delay, duration:duration, y: y}}")
    slot

</template>