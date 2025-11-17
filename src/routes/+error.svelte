<script lang="ts">
  import { page } from "$app/state";

  let message = $derived.by(() => {
    const m = page?.error?.message;
    if (m == "Not Found") {
      return "It seems we were unable to locate the page you were looking for page.";
    } else if (m) {
      return m;
    } else return "Not a Gonk";
  });
</script>

<div class="page-x-padding min-h-screen pt-8">
  <div class="max-w-prose">
    <h1 class="font-display text-10vw text-maximumYellow">{page.status}</h1>
    <div>{message}</div>
  </div>
</div>
