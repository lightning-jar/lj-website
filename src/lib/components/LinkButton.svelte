<script lang="ts">
import type { Snippet } from "svelte";
import type { Link } from "$types/Link";

import * as sfx from "$lib/sfx";

interface Props {
	children?: Snippet | null;
	classes?: string;
	link: Link;
	onclick?: (e: MouseEvent) => void;
}

let { children, classes = "", link, onclick }: Props = $props();
</script>

<a
  href={link?.href ?? null}
  rel={link.rel ?? null}
  target={link.target ?? null}
  title={link.title ?? null}
  class="button {classes || ''}"
  onmouseenter={(e) => {
    sfx.play("click");
    if (onclick) {
      onclick(e);
    }
  }}
  onclick={(e) => {
    sfx.play("click");
    if (onclick) {
      onclick(e);
    }
  }}
>
  <!-- children -->
  {@render children?.()}
</a>
