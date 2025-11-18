<script lang="ts">
// types
interface Tile {
	category?: string | null;
	color?: string | null;
	customer?: string | null;
	imageAlt?: string | null;
	imageSlug?: string | null;
	logoAlt?: string | null;
	logoSlug?: string | null;
	tags?: string[] | null;
	text?: string | null;
	url?: string | null;
}

// props
let { tile, text = "" }: { tile: Tile; text: string } = $props();

// variables
let image = $derived({
	alt: tile.imageAlt ?? "",
	classes: "opacity-full",
	draggable: "false",
	height: "648",
	fallback: `${tile.imageSlug}.webp`,
	folder: "images",
	loading: "lazy",
	width: "810",
	slugCommon: tile.imageSlug ?? "",
	style: null,
});
</script>

<div
  class="font-sans uppercase tracking-widest px-16 leading-normal mb-4 text-center text-white/60 text-[.825rem] h-[1rem] sm:hidden"
>
  <!-- category -->
  <div>{tile.category}</div>

  <a
    class="w-full text-oxfordBlue block outline-white outline outline-0 rounded-t-lg overflow-hidden transition-opacity"
    data-customerTile
    href={tile.url}
  >
    <!-- logo -->
    <div class="flex justify-center w-full">
      <div
        class="h-auto border-y-0 border-white py-4 border-opacity-60 w-72 sm:hidden"
      >
        <img
          class="w-auto h-full"
          alt={tile.logoAlt}
          height="32"
          loading="lazy"
          src="/images/{tile.logoSlug}.avif"
          width="178"
        />
      </div>
    </div>

    <!-- tile header -->
    <div class="relative overflow-hidden mb-6 rounded-t-lg bg-white/0">
      <div class="w-full relative pt-[70%]">
        <picture class="flex absolute inset-0 bg-neutral-100/5">
          <img
            class="min-w-full min-h-full object-cover object-center"
            alt={tile.imageAlt}
            height={image.height ?? null}
            loading="lazy"
            src="/images/{tile?.imageSlug}.webp"
            width={image.width ?? null}
          />
        </picture>
      </div>
    </div>

    <!-- logo position two -->
    <div
      class="hidden justify-center w-full bottom-0 z-10 mb-4 sm:flex bg-oxford/20"
    >
      <div class="w-3/4">
        <img
          class="w-auto h-full"
          alt={tile.logoAlt}
          height="32"
          loading="lazy"
          src={`/images/${tile.logoSlug}.avif`}
          width="178"
        />
      </div>
    </div>

    <!-- tile body -->
    <div class="px-0 pb-8 relative">
      <div>
        <p
          class="text-cultured/90 font-light md:text-oxford text-center sm:hidden prose-md mb-2 line-clamp-6"
        >
          {text}
        </p>
        <div class="flex justify-center flex-wrap">
          {#each tile.tags as tag}
            <span
              class="text-maximumYellow text-sm inline-block mr-2 opacity-80 transition-opacity hover:opacity-100"
              >{"#" + tag}</span
            >
          {/each}
        </div>
      </div>
    </div>
  </a>
</div>
