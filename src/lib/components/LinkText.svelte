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

const defaultClasses =
	"block leading-snug text-15px opacity-80 underline underline-offset-4 hover:opacity-100 hover:text-maximumYellow";
</script>

<a
  href={link?.href ?? null}
  rel={link.rel ?? null}
  target={link.target ?? null}
  title={link.title ?? null}
  class="{defaultClasses} {classes || ''}"
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
