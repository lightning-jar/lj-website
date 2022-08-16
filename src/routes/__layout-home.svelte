
<script context="module">

  /*
  // graphQl
  import { GraphQLClient} from 'graphql-request';

  //settings
  import { graphCMSEndpoint } from '$settings/apiSettings';
  import { footerQuery } from '$settings/querySettings';


  export async function load() {

    const graphcms = new GraphQLClient(graphCMSEndpoint, { headers: {} });
    const footerData = await graphcms.request(footerQuery);

    return {
      props: {
        footerData
        }
      }
    } */
</script>


<script lang="ts">

  // import css file
  import "../app.css";

  // import components
  import StructuredData from "$a/StructuredData.svelte";
  import GoogleAnalytics from "$a/GoogleAnalytics.svelte";
  import OpenGraph from "$a/OpenGraph.svelte";
  import WindowUpdater from "$m/WindowStoreUpdater.svelte";
  import GlobalNav from "$components/organisms/GlobalNav.svelte";
  import GlobalFooter from "$components/organisms/GlobalFooter.svelte";
  import MediaPlayer from "$o/MediaPlayer.svelte";




  // import types
  //import type { Footer } from '$types/footerTypes';

  // props
  export let globalNavEl: HTMLHeadElement;
  export let mainNav: HTMLDivElement;

  // variables
  const section = "home"

  // content for open graph
  const og = {
    type:'website',
    url: 'https://lightningjar.com',
    title: 'Lightning Jar',
    description: 'Lightning Jar is a technology studio & digital agency helping businesses thrive in a world that is more digital &amp; mobile every day',
    images: [
      {
        src: 'https://lightningjar.com/images/lightning-jar-og.jpg',
        alt: 'Lightning Jar Logo',
        width: '800',
        height: '600',
      }
    ]
  }

</script>


<template lang="pug">
GoogleAnalytics
StructuredData
OpenGraph("{...og}")
WindowUpdater
MediaPlayer

div.absolute.w-full
  GlobalNav(
    bind:globalNav!="{globalNavEl}"
    bind:mainNav!="{mainNav}"
    "{section}"
    )

slot

GlobalFooter()


</template>

