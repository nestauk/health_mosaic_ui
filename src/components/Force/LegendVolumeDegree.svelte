<script>
  export let linecolor = "black";
  export let textcolor = "black";
</script>

<svg
  height="100px"
  viewBox="0 0 200 200"
  width="100px"
>
  <defs>
    <marker
      id="Triangle"
      viewBox="0 0 10 10"
      refX="10"
      refY="5"
      markerUnits="strokeWidth"
      markerWidth="4"
      markerHeight="3"
      orient="auto"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" />
    </marker>
  </defs>
  <g transform="translate(50,150)">
    <g>
      <line
        stroke="{linecolor}"
        y1="-25"
        y2="25"
      />
      <line
        stroke="{linecolor}"
        x1="-25"
        x2="25"
      />
    </g>
    <g>
      <line
        stroke="{linecolor}"
        x2="100"
        y2="-100"
      />
      <line
        marker-end="url(#Triangle)"
        stroke="{linecolor}"
        stroke-opacity="0"
        stroke-width="5"
        x1="100"
        y1="-100"
      />
      <text
        dominant-baseline="middle"
        font-size="20"
        text-anchor="start"
        x="45"
        y="-25"
      >Degree</text>
    </g>
    <g transform="translate(100,-100)">
      <circle
        r="30"
        fill="none"
        stroke="{linecolor}"
        stroke-width="3"
      />
      <text
        dominant-baseline="middle"
        font-size="20"
        text-anchor="end"
        x="-40"
      >Volume</text>
    </g>
  </g>
</svg>
