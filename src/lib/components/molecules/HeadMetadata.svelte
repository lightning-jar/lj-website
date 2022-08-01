<script lang="ts">

// components
import GoogleAnalytics from "$a/GoogleAnalytics.svelte";


// props
export let metaKeywords: string[];
export let metaSection: string;
export let metaNoIndex: boolean = false;
export let metaDescription: string = '';

// functions
import { buildMetaTitle } from "$functions/metadataFunctions";

// variables
const title = buildMetaTitle(metaKeywords)

</script>


<template lang="pug">

  svelte:head
    title {title}
    meta(
      name="section"
      content!="{metaSection}"
      )
    //+if('metaSection == "home"')
      meta(
        name="google-site-verification" content="2VX5GkPRx2Ph-JvsVG18sOgeqGnF9-vEhDFwg01Bd_g"
        )
    +if('metaNoIndex')
      meta(
        name="robots"
        content="noindex"
      )
    +if('metaDescription')
      meta(
        name="description"
        content!="{metaDescription}"
      )
    //GoogleAnalytics

</template>