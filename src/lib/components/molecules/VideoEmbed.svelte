<script lang='ts'>

  // stores
  import { mediaPlayer, youTubeCode } from "$lib/stores/mediaPlayerStore";

  // components
  import PictureStack from "$a/PictureStack.svelte";

  // settings
  import { imagesFolder } from "$settings/mediaSettings";

  // functions
  function launchPlayer() {
    $youTubeCode = youTube;
    $mediaPlayer = true;
  }

  export let youTube = '';



  const videoThumbnail = {
    alt:"Bauhaus Documentary - Thumbnail",
    breakpoints: [
      // unique slug, [rule 1], [rule 2]
      ['-388', ['max-width', '420.99px'], ['orientation', 'portrait']],
      ['-486', ['max-width', '575.99px']],
      ['-658', ['max-width', '767.99px']],
      ['-928', ['max-width', '991.99px']],
      ['-1200', ['max-width', '1199.99px']],
      ['-1400', ['min-width', '1400px']]
    ],
    classes:"block rounded-lg",
    height:"675",
    width:"1200",
    fallback: "video-thumb-bahaus-1200.jpg",
    slugCommon: "video-thumb-bahaus",

  }

</script>

<template lang='pug'>



  .relative.w-full

    //- video play button
    .absolute.inset-0.flex.justify-center.items-center
      button.bg-titaniumYellow.px-5.py-2(
        on:click|stopPropagation!="{launchPlayer}"
        ) Watch Me

    //- video thumbnail
    PictureStack(
      "{...videoThumbnail}"
    )

</template>