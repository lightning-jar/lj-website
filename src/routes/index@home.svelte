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

  // Svelte
  import { fade } from "svelte/transition";

  // components
  import FadeIn from "$s/FadeIn.svelte";
  import FlyIn from "$s/FlyIn.svelte";
  import HomeBanner from "$o/HomeBanner.svelte";
  import HomeOverview from "$o/HomeOverview.svelte";
  import HeadMeta from '$m/HeadMetadata.svelte';
  import HomeVideo from '$o/HomeVideo.svelte';
  import HomeServices from '$o/HomeServices.svelte';
  import HomeTestimonials from "$o/HomeTestimonials.svelte";

  //import GlobalNav from '$components/GlobalNav.svelte';
  //import HomeOverview from '$components/HomeOverview.svelte';
  //import HomeBillboardWidget from '$components/HomeBillboardWidget.svelte';
  //import HomeAboutTiles from '$components/HomeAboutTiles.svelte';




  // import types
  //import type { Link } from '$types/linkTypes';
  //import type { Terminal, TerminalCluster } from '$types/terminalTypes';
  //import type { BillboardContent }  from '$types/billboardTypes';
  //import type { HomePageContent }  from '$types/pageTypes';
  //import type { HomeOverviewContent }  from '$types/homeOverviewTypes';
  //import type { HomeAboutTile }  from '$types/tileTypes';

  // props
  //export let homePageData: Record<'homePage', HomePageContent>;
  //export let terminalsData: Record<'terminals', Terminal[]>;
  //export let clustersData: Record<'clusters', TerminalCluster[]>;
  //export let c: HomePageContent;
  //export let billboardContent: BillboardContent;
  //export let bulletinContent: Link;
  //export let overviewContent: HomeOverviewContent;
  //export let tilesData: HomeAboutTile[];

  // reactive
   /*$: {
     c = homePageData.homePage; ;
     billboardContent = c.billboard;
     bulletinContent = (c.bulletin) ? c.bulletin : null;
     overviewContent = (c.homeOverview) ? c.homeOverview : null;
     tilesData = (c.aboutTiles) ? c.aboutTiles : null;
    }; */

  let loaded = false;
  setTimeout(() => {
   loaded = true;
  }, 10);

  // variables for head
  const metaKeywords = ['Lightning Jar | Digital Studio'];
  const metaDescription = 'lorem ipsum dolor';
  const metaSection = 'home';

</script>

<template lang="pug">
  div
    FadeIn(
      delay!="{'100'}"
      duration!="{'200'}"
      )
      HomeBanner
  div
    FlyIn(
      delay!="{'200'}"
      duration!="{'200'}"
      y!="{'200'}"
      )
      HomeOverview

  div
    HomeVideo

  HomeServices
  HomeTestimonials

  HeadMeta("{metaKeywords}" "{metaSection}" "{metaDescription}")
  //HomeOverview("{overviewContent}" "{terminalsData}" "{clustersData}")
  //HomeAboutTiles("{tilesData}")
</template>


