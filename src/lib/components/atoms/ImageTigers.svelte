<template lang='pug'>
picture
  source(
    type="image/avif"
    srcset="images/lj-tigers-transparent-348.avif"
    media="(max-width: 420px)"
    )
  source(
    type="image/webp"
    srcset="images/lj-tigers-transparent-348.webp"
    media="(max-width: 420px)"
    )
  source(
    type="image/avif"
    srcset="images/lj-tigers-transparent-493.avif"
    media="(min-width: 578px)"
    )
  source(
    type="image/webp"
    srcset="images/lj-tigers-transparent-493.webp"
    media="(max-width: 578px)"
    )
  img.w-full.h-auto.select-none(
    height="966"
    width="912"
    title="I'm going to bite your tail. No, I'm going to bite YOUR tail."
    draggable="false"
    alt="two tigers"
    src="images/lj-tigers-opaque-493.jpg"
    )
</template>