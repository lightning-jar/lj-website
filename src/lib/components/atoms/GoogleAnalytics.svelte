<script lang="ts">

  // settings
  import { googleAnalyticsId } from "$settings/analyticsSettings";

  // variables
  let analytics = true;
  $: { analytics = (process.env.NODE_ENV != "development") }


  // UA-62594120-1


</script>

<template lang="pug">
  svelte:head
    +if('analytics')
      script(async src!="{'https://www.googletagmanager.com/gtag/js?id=' + googleAnalyticsId}")
      script.
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments) }
        gtag("js", new Date());
        gtag("config", "UA-62594120-1");
</template>