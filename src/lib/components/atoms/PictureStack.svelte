<script lang='ts'>

  // this component creates a stack of images in the picture tag
  // the breakpoint prop takes unique filename and media rules in this format:
  // ['unique slug', [ruleName, ruleValue] ... more rules]
  // example: ['-388', ['max-width', '420.99px'], ['orientation', 'portrait']]

  // components
  import PictureStackFallback from "$a/PictureStackFallback.svelte";
  import PictureStackSource from "$a/PictureStackSource.svelte";

  // props
  export let alt: string = '';
  export let breakpoints: (string | string[])[] = [];
  export let classes: string = '';
  export let fallback: string = '';
  export let folder: string = 'images';
  export let height: string | null = null;
  export let onlyScreen: boolean = true;
  export let sourceFormats: string[] = ['avif', 'webp'];
  export let slugCommon: string = '';
  export let style: string | null = null;
  export let width: string | null = null;


  // local functions
  function type(format: string) {
    let type: string;
    type = `image/${format}`
    type = (format == 'svg') ? 'image/svg+xml' : type;
    type = (format == 'jpg') ? 'image/jpeg' : type;
    return type
  }
  function srcset(breakpoint: (string | string[])[], format:string) {
    return `${folder}/${slugCommon}${breakpoint[0]}.${format}`;
  }
  function media(breakpoint: (string | string[])[] ) {
    let media: string = '';
    const hasContent: boolean = (breakpoint.length > 0);
    const hasRules:boolean = (breakpoint[1] && breakpoint[1][0]);

    // add 'only screen' if true
    media += (onlyScreen && hasContent && hasRules) ? 'only screen and ' : '';

    // iterate media rules
    breakpoint.forEach(datum => {
      const index = breakpoint.indexOf(datum);

      if (index > 0) {

        // for additional rules
        if (index > 1) media += ' and ';

        // all rules
        if (breakpoint[index][0]) {
          media += `(${breakpoint[index][0]}: ${breakpoint[index][1]})`
        }
      }
    })

    return (media) ? media : null;

  }

  // variables
  const fallbackImage = {
    alt: alt,
    classes: classes,
    filename: fallback,
    folder: folder,
    height: height,
    width: width,
    style: style
  }


</script>

<template lang='pug'>
picture
  +each('breakpoints as breakpoint')
    +each('sourceFormats as format')
      PictureStackSource(
        media="{media(breakpoint)}"
        srcset="{srcset(breakpoint, format)}"
        type="{type(format)}"
        )
  PictureStackFallback("{...fallbackImage}")
</template>