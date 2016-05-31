# API Reference

## Core

### `Stack`

`Stack`s are the basic unit of layout. Any direct children will be automatically styled and sized to overlay on one another, stacking in the Z direction. `Stack`s may be freely nested.

#### Props

- `className?: string`: space-separated DOM classnames to be merged with the default class names.
- `pixelRatio?: number`: the desired pixel density of this chart. See [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). Performance may suffer with higher densities. This value is not transparently applies and must be explicitly respected by any contained `Layer`s (the built-in ones all do).

## Connected