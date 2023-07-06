

<script lang="ts">


  // stores
  import { page } from "$app/stores";


  // components
  import HomeBanner from "$o/HomeBanner.svelte";
  import HomeCustomers from "$o/HomeCustomers.svelte";
  import HomeOverview from "$o/HomeOverview.svelte";
  import HeadMeta from '$m/HeadMetadata.svelte';
  import HomeVideo from '$o/HomeVideo.svelte';
  import HomeServices from '$o/HomeServices.svelte';
  import HomeTestimonials from "$o/HomeTestimonials.svelte";
  import HomeContact from "$o/HomeContact.svelte";
  import MediaPlayer from "$o/MediaPlayer.svelte";
  import OpenGraph from "$a/OpenGraph.svelte";
  import StructuredData from "$a/StructuredData.svelte";
  import WindowUpdater from "$m/WindowStoreUpdater.svelte";

  // variables for head
  const headAttributes = {
  metaKeywords: ['Lightning Jar | Web Studio'],
  metaDescription: 'Lightning Jar is a technology studio & digital agency helping businesses thrive in a world that is more digital & mobile every day',
  metaSection: 'home',
  metaNofollow: false,
  metaNoindex: false,
  additionalMetaTags: [
    /*{
    name:"google-site-verification",
    content:"2VX5GkPRx2Ph-JvsVG18sOgeqGnF9-vEhDFwg01Bd_g"
    }*/
  ],
  additionalLinkTags: []
  }

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
  WindowUpdater
  OpenGraph("{...og}")
  StructuredData
  MediaPlayer

  HomeBanner
  HomeOverview
  HomeVideo
  HomeServices
  HomeTestimonials
  HomeCustomers
  HomeContact

  HeadMeta("{...headAttributes}")

  //HomeOverview("{overviewContent}" "{terminalsData}" "{clustersData}")
  //HomeAboutTiles("{tilesData}")

</template>


