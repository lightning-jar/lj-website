<script lang="ts">

  // from plugin
  import { MetaTags, JsonLd } from "svelte-meta-tags"

  // components
  import { LjSchema } from "$lib/settings/structuredData";

  // props
  export let additionalMetaTags = [];
  export let additionalLinkTags = [];
  export let canonical: string = 'https://lightningjar.com';
  export let metaKeywords: string[];
  export let metaSection: string;
  export let metaNoindex: boolean = false;
  export let metaNofollow: boolean = false;
  export let metaDescription: string | null;

  // imported functions
  import { buildMetaTitle } from "$functions/metadataFunctions";


  // variables
  const title = buildMetaTitle(metaKeywords);

  // local functions
  function indexFollow() {
    const index = (metaNoindex) ? 'noindex' : 'index';
    const follow = (metaNofollow) ? 'nofollow' : 'follow';
    return `${index}, ${follow}`
  }



  const data = [
    {
      tag: 'title',
      content: buildMetaTitle(metaKeywords)
    },
    {
      tag: 'meta',
      att: {
        name: 'description',
        content: metaDescription
      }
    },
    {
      tag: 'meta',
      att: {
        name: 'section',
        content: metaSection
      }
    },
    {
      tag: 'meta',
      att: {
        name: 'robots',
        content: indexFollow()
      }
    },
    {
      tag: 'meta',
      att: {
        name: 'googlebot',
        content: indexFollow()
      }
    },
    {
      tag: 'link',
      att: {
        name: 'canonical',
        content: canonical
      }
    },
  ]

  //- add additional meta tags to data object
  additionalMetaTags.forEach(item => {
    const obj = {tag: 'meta', att: item}
    data.push(obj)
  })

  //- add additional link tags to data object
  additionalLinkTags.forEach(item => {
    const obj = {tag: 'link', att: item}
    data.push(obj)
  })


  const og = {
    type: 'website',
    url: 'https://lightningjar.com',
    title: 'Lightning Jar',
    description: metaDescription,
    images: [
      {
        url: 'https://lightningjar.com/images/lightning-jar-og.jpg',
        width: 864,
        height: 128,
        alt: 'Lightning Jar Logo',
      },
      {
        url: 'https://lightningjar.com/images/lightning-jar-og-b.jpg',
        width: 864,
        height: 128,
        alt: 'Lightning Jar Logo - B',
      },
    ],
  }

</script>


<template lang="pug">


  svelte:head
    +each('data as datum')
      +if('datum.tag == "title"')
        title { datum.content }
        +elseif('datum.tag == "meta"')
          meta("{...datum.att}")
        +elseif('datum.tag == "link"')
          link("{...datum.att}")




</template>
