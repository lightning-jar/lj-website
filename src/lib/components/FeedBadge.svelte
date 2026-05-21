<script lang="ts">
let {
	href,
	label = "Atom",
}: {
	href: string;
	label?: string;
} = $props();
</script>

<a
  {href}
  title="Subscribe via Atom feed"
  rel="alternate"
  type="application/atom+xml"
  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-maximumYellow text-maximumYellow text-14px font-700 leading-none hover:bg-maximumYellow hover:text-oxford transition-colors shrink-0"
>
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    class="fill-current"
  >
    <path
      d="M4 4a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4zm0 6a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7v-3zm2 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
    />
  </svg>
  {label}
</a>
