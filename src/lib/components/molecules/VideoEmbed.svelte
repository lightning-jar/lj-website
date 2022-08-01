<script lang='ts'>

</script>

<template lang='pug'>

  .relative.w-full

    picture
      source(
        type="image/avif"
        srcset="images/video-thumb-bahaus-388.avif"
        media="(max-width: 420.99px)"
        )
      source(
        type="image/webp"
        srcset="images//video-thumb-bahaus-388.webp"
        media="(max-width: 420.99px)"
        )
      source(
        type="image/avif"
        srcset="images//video-thumb-bahaus-486.avif"
        media="(max-width: 575.99px)"
        )
      source(
        type="image/webp"
        srcset="images//video-thumb-bahaus-486.webp"
        media="(max-width: 575.99px)"
        )
      source(
        type="image/avif"
        srcset="images//video-thumb-bahaus-658.avif"
        media="(max-width: 767.99px)"
        )
      source(
        type="image/webp"
        srcset="images//video-thumb-bahaus-658.webp"
        media="(max-width: 767.99px)"
        )
      source(
        type="image/avif"
        srcset="images//video-thumb-bahaus-928.avif"
        media="(max-width: 991.99px)"
        )
      source(
        type="image/webp"
        srcset="images//video-thumb-bahaus-928.webp"
        media="(max-width: 991.99px)"
        )
      source(
        type="image/avif"
        srcset="images//video-thumb-bahaus-1200.avif"
        media="(max-width: 1199.99px)"
        )
      source(
        type="image/webp"
        srcset="images//video-thumb-bahaus-1200.webp"
        media="(max-width: 1199.99px)"
        )
      source(
        type="image/avif"
        srcset="images//video-thumb-bahaus-1400.avif"
        media="(min-width: 1200px)"
        )
      source(
        type="image/webp"
        srcset="images//video-thumb-bahaus-1400.webp"
        media="(min-width: 1200px)"
        )
      img.block.w-full.h-auto.rounded-lg.select-none.rounded-xl(
        alt="Bauhaus Documentary - Thumbnail Image"
        title="Bauhaus Painting"
        loading="lazy"
        height="675"
        width="1200"
        src="images//video-thumb-bahaus-1200.jpg"
        style=""
        )


  //.col-12.offset-n12.text-center
    //- Button
    a.btn.btn-primary.lift.aos-init.aos-animate(
      data-aos-delay="250"
      data-aos="zoom-in-top"
      href="#"
      data-bigpicture="{'ytSrc': '2a45UBCIbJc'}"
      draggable="false"
      )
      span.d-inline-block.small.align-top.me-3
        svg(
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 11"
          height="1em"
          width="0.727em"
          )
          path(
            fill="currentColor"
            d="M0 9.63V1.19C0 .683.567.38.988.664l6.455 4.334A.634.634 0 017.43 6.06L.975 10.166A.635.635 0 010 9.631z"
            )
      | Watch Me
</template>