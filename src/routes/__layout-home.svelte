
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
  import WindowUpdater from "$m/WindowStoreUpdater.svelte";
  import GlobalNav from "$components/organisms/GlobalNav.svelte";
  import MediaPlayer from "$o/MediaPlayer.svelte";


  //import GlobalFooter from "$components/GlobalFooter.svelte";

  // import types
  //import type { Footer } from '$types/footerTypes';

  // props
  export let globalNavEl: HTMLHeadElement;
  export let mainNav: HTMLDivElement;



  //export let footerData: Record<'footer', Footer>;

  // variables
  const section = "home"

</script>


<template lang="pug">

  WindowUpdater
  MediaPlayer


  GlobalNav(
    bind:globalNav!="{globalNavEl}"
    bind:mainNav!="{mainNav}"
    "{section}"
    )
  slot

  //GlobalFooter(
    footerData!="{footerData}"
    )


</template>

