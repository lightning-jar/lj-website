<script context="module">


  /*
  // graphQl
  import { GraphQLClient, gql} from 'graphql-request';

  // settings
  import { graphCMSEndpoint } from '$settings/apiSettings';
  import { terminalsQuery, clustersQuery, homeQuery } from '$settings/querySettings';

  export async function load() {
    const graphcms = new GraphQLClient(graphCMSEndpoint, { headers: {} });
    const homePageData = await graphcms.request(homeQuery);
    const terminalsData = await graphcms.request(terminalsQuery);
    const clustersData = await graphcms.request(clustersQuery);

    return {
      props: {
        homePageData,
        terminalsData,
        clustersData,
      }
    }
  } */
</script>

<script lang="ts">

  // Svelte & Plugins
  //import { fade } from "svelte/transition";

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


</script>

<template lang="pug">

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


