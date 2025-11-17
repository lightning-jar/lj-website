<script lang="ts">
  import { nanoid } from "nanoid";
  let { classes = "" } = $props();

  const a = nanoid();
  const b = nanoid();
</script>

<svg
  height="59"
  class="w-full h-auto {classes}"
  viewBox="0 0 39 59"
  width="39"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <clipPath id={a}>
      <path d="M39 0v59H0V0h39z" />
    </clipPath>
    <clipPath id={b}>
      <path
        d="M35.481.004a1.35 1.35 0 0 1 .53.156 1.33 1.33 0 0 1 .5.474 1.34 1.34 0 0 1 .195.661 1.34 1.34 0 0 1-.162.67l-10.468 19.19 11.622 6.209c.193.102.359.254.48.436a1.34 1.34 0 0 1 .216.612 1.33 1.33 0 0 1-.099.642 1.34 1.34 0 0 1-.391.518L2.191 58.291c-1.338.778-2.812-.235-1.917-1.796l18.345-26.391L6.453 23.61c-.196-.104-.365-.26-.487-.446s-.195-.404-.212-.626a1.34 1.34 0 0 1 .116-.651c.093-.203.237-.382.415-.515L34.591.262c.218-.162.481-.253.752-.262h-.001z"
      />
    </clipPath>
  </defs>
  <g clip-path="url(#{a})">
    <g clip-path="url(#{b})">
      <path d="M0 0h38.4v58.559H0V0z" class="fill-current" />
    </g>
  </g>
</svg>
