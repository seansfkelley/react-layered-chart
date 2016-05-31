# API Reference

## Core

### `Stack`

`Stack`s are the basic unit of layout. Any direct children will be automatically styled and sized to overlay on one another, stacking in the Z direction. `Stack`s may be freely nested.

#### Props

- `className?: string`: space-separated DOM classnames to be merged with the default class names.
- `pixelRatio?: number`: the desired pixel density of this chart. See [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). Performance may suffer with higher densities. This value is not transparently applied and must be explicitly respected by any contained `Layer`s (the built-in ones all do).

<hr/>

### `ChartProvider`

`ChartProvider` is the parent of all state-managed layers in react-layered-chart. It creates little DOM of its own, and is a wrapper around react-redux's [`Provider`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#provider-store) that mediates between its own props and state that is automatically loaded/computed.

### Props

- `seriesIds: string[]`: a list of all the series that are present in this chart. IDs are arbitrary and must be unique within a single `ChartProvider`.
- `loadData <signature forthcoming>`: a stateless function to load the appropriate data for all series. Called whenever `ChartProvider` needs new data. This is where you should do caching or other loading optimizations.
- `chartId?: string`: an arbitrary, globally-unique ID for the state of this chart that maintains a reference across mount/unmount cycles.
- `defaultState?: Object`: UI state to seed the internal store with. This value is only respected once, at initialization time.
- `onLoadStateChange?: (isLoading: Object<boolean>) => void`: called whenever the load state changes for any series.

## Layers

## State Management

## Utilities

### Decorators

#### `AnimateProps`

A class decorator to animate prop values by repeatedly setting values on state. Specify the props to animate using an instance variable named `animatedProps`, which is a map from prop names to millisecond durations. Animated values will be set on component state any time the component updates with the name `` `animated_${propName}` ``. Interpolation is delegated to [d3-interpolate](https://github.com/d3/d3-interpolate).

You can access a mixin version at `AnimatedProps.Mixin`.

```tsx
import { AnimateProps } from 'react-layered-chart';

interface Prop {
  interpolatableValue: string;
}

@AnimateProps
class ExampleComponent extends React.Component<Props, ...> {
  animatedProps = {
    interpolatableValue: 250
  };
  
  render() {
    console.log(this.state.animated_interpolatableValue);
  }
}
```

<hr/>

#### `CanvasRender`

A class decorator to defer the bulk of rendering work until the next [animation frame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). Useful primarily for rendering that cannot be represented in the virtual DOM, such as when rendering to a `<canvas>`. You must define a method named `canvasRender` that does the actual rendering.

You can access a mixin version at `CanvasRender.Mixin`.

```tsx
import { CanvasRender } from 'react-layered-chart';

@CanvasRender
class ExampleComponent extends React.Component<...> {
  render() {
    return <canvas ref='canvas'/>;
  }
  
  canvasRender() {
    const canvas = this.refs.canvas;
    // Do the actual rendering work.
  }
}
```

<hr/>

#### `PixelRatioContext`

A class decorator to allow a class to receive a context value called `pixelRatio` that specifies the pixel density for this chart. See [`Stack`](#stack) for more on this value. This context value only exists when the class in question is inside a `Stack`.

You can access a mixin version at `PixelRatioContext.Mixin`.

```tsx
import { PixelRatioContext, Context } from 'react-layered-chart';

@PixelRatioContext
class ExampleComponent extends React.Component<...> {
  // For Typescript usage, you have to specify the type of the context field like so.
  context: Context;
  
  render() {
    console.log(this.context.pixelRatio);
  }
}
```

### Functions

#### `getBoundsForInstantaneousData(data: any[], range: Range, timestampPath: string)`

Efficiently computes which span of indices in `data` intersect `range`. Each item in `data` is assumed to have a single "timestamp" value, the dot-separated path to which is given by `timestampPath`. `data` should be sorted by `timestampPath`, ascending.

**Note**: because this function is intended as a helper to make rendering more efficient, it includes items just beyond the ends of the range as well so halfway-visible data will still be rendered.

```
const data = [
  { 
    value: 10, 
    metadata: { timestamp: 15 }
  }, 
  ...
]

getBoundsForInstantaneousData(data, { min: 0, max: 1000 }, 'metadata.timestamp');
// -> { firstIndex: 0, lastIndex: ... }
```

<hr/>

#### `getBoundsForTimeSpanData(data: any[], range: Range, minPath: string, maxPath: string)`

Efficiently computes which span of indices in `data` intersect `range`. Each item in `data` is assumed to have a "start time" and an "end time", the dot-separated path to which is given by `minPath` and `maxPath` respectively. `data` should be sorted by `minPath`, ascending.

**Note**: because this function is intended as a helper to make rendering more efficient, it includes items just beyond the ends of the range as well so halfway-visible data will still be rendered.

```
const data = [
  { 
    value: 10, 
    timeRange: { from: 0, to: 47 } 
  }, 
  ...
]

getBoundsForTimeSpanData(data, { min: 0, max: 1000 }, 'timeRange.from', 'timeRange.to');
// -> { firstIndex: 0, lastIndex: ... }
```

<hr/>

#### `resolvePan(range: Range, delta: number): Range`

Shift both endpoints of the range over by the specified amount.

```
resolvePan({ min: 0, max: 100 }, 10); 
// -> { min: 10, max: 110 }
```

<hr/>

#### `resolveZoom(range: Range, factor: number, anchorBias?: number): Range`

Zoom the given range in/out by the specified factor. `factor > 1` zooms in, `factor < 1` zooms out. If provided, `anchorBias` should be a value on `[0, 1]` that specifies where the focus of the zoom is, where 0 means to hold the minimum value constant (therefore moving only the maximum value to perform the requested zoom) and 1 vice-versa.

```
resolveZoom({ min: 0, max: 100 }, 2);
// -> { min: 25, max: 75 }

resolveZoom({ min: 0, max: 100 }, 2, 0);
// -> { min: 0, max: 50 }
```
