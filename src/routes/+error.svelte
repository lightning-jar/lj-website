<script lang="ts">
import { page } from "$app/state";

let message = $derived.by(() => {
	const m = page?.error?.message;
	if (m === "Not Found") {
		return "It seems we were unable to locate the page you were looking for.";
	} else if (m) {
		return m;
	} else return "Not a Gonk";
});
</script>

<svelte:head>
  <title
    >{page.status === 404 ? "Page Not Found" : `Error ${page.status}`} - LJ</title
  >
</svelte:head>

<main id="main" class="page-x-padding min-h-screen pt-8">
  <div class="max-w-prose">
    <h1 class="heading-1 text-10vw">{page.status}</h1>
    <div>{message}</div>
  </div>
</main>
