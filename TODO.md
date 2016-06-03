- maybe export connected layers as `LineLayer.Connected`? the names now are awful
- proptypes for more things
- replace docs for animateprops with react-motion
- fix issue where changing the number of arrays passed to Y axis layer causes leftover domains
  - if you initially render with 2 domains, then later drop it to 1, you get two problems:
    1. you don't know which of the original two the new one should match, if any
    2. d3-interpolate/animateprops leave the extraneous one behind and it continues to render
  - proposed solution
    1. reshape the props to Y axis to take something like { domain, ticks, .... animatedId? }[]
    2. create helper components for Y axis layer that are keyed on animatedId and individually AnimatedProps'd
    3. yaxislayer becomes a <div> that wraps a bunch of these <canvas>es
