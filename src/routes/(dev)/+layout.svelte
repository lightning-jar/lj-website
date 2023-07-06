

<script lang="ts">

  // import css file
  import "/src/app.css";

  // import components
  import GoogleAnalytics from "$a/GoogleAnalytics.svelte";
  import GlobalNav from "$components/organisms/GlobalNav.svelte";
  import GlobalFooter from "$components/organisms/GlobalFooter.svelte";

  // props
  export let globalNavEl: HTMLHeadElement;
  export let mainNav: HTMLDivElement;

</script>


<template lang="pug">
GoogleAnalytics

.absolute.w-full
  GlobalNav(
    bind:globalNav!="{globalNavEl}"
    bind:mainNav!="{mainNav}"
    )

slot

GlobalFooter()

</template>

