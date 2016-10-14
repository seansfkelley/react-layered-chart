# react-layered-chart Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

### Added

- Added `loadDataContext` prop to `ChartProvider` for passing along state to the `loadData` function without creating new `Function` instances. [#37](https://github.com/palantir/react-layered-chart/issues/37).
- Added `chainLoaders` utility method to combine multiple `DataLoader`s into one for easy composition. [#38](https://github.com/palantir/react-layered-chart/issues/38).

### Changed

- `getIndexBoundsForPointData` and `getIndexBoundsForSpanData` now accept function accessors. [#10](https://github.com/palantir/react-layered-chart/issues/10).
- `ChartProvider` no longer automatically attaches debug tools. Instead, it accepts a `debugStoreHooks` prop to allow customization. [#73](https://github.com/palantir/react-layered-chart/issues/73).

## 1.5.1 (2016-10-11)

### Fixed

- Added back missing `joinType` props to `ConnectedSimpleLineLayer` and `ConnectedBucketedLineLayer`. [84054e2](https://github.com/palantir/react-layered-chart/commit/84054e2925e5f6694e90fc141e4cdc7b842b1f74).

## 1.5.0 (2016-10-10)

### Added

- `XAxis` and `YAxis` as more-flexible versions of `XAxisLayer` and `YAxisLayer`. [#72](https://github.com/palantir/react-layered-chart/issues/72).

### Deprecated

- `XAxisLayer` and `YAxisLayer` in favor of `XAxis` and `YAxis`. [#72](https://github.com/palantir/react-layered-chart/issues/72).
- `loadData`'s 3rd (`currentYDomains`) and 5th (`currentData`) arguments are deprecated in favor of the new 6th argument (`currentLoadedData`). [#77](https://github.com/palantir/react-layered-chart/pull/77).
- `createStaticDataLoader` is deprecated in favor of creating a `Promise` and returning your data from that. [#79](https://github.com/palantir/react-layered-chart/issues/79).
- `wrapDataLayerWithConnect` is deprecated with no replacement. [#32](https://github.com/palantir/react-layered-chart/issues/32).

### Changed

- Expanded the legal arguments to `computeTicks`. [#23](https://github.com/palantir/react-layered-chart/pull/23).
- Added an extra argument to `loadData` for the currently-loaded data. [#77](https://github.com/palantir/react-layered-chart/issues/77).
- The data-loading pipeline no longer uses `setYDomains`, thus avoiding mixed signals when custom components try to use `setYDomains` also. `setYDomains` now always takes precedence over the values returned from `loadData`. [#77](https://github.com/palantir/react-layered-chart/issues/77).
- `ChartProvider`'s `yDomains` prop and the `setYDomains` action creator no longer need to include an entry for every series. Whatever subset they provide will be merged with any appropriate defaults. [#78](https://github.com/palantir/react-layered-chart/issues/78).
- "Connected" data-rendering layers now throw an exception if asked to render a series ID that doesn't exist in the chart. [#60](https://github.com/palantir/react-layered-chart/issues/60).
- `ChartProvider`'s `seriesIds` prop is now ordering-independent and will not trigger loads for series IDs that already exist, regardless of position. [d4f56db](https://github.com/palantir/react-layered-chart/commit/d4f56dbfe1588fbbe7f3a66838b047089deed3fb).
- `PollingResizingCanvasLayer` now eagerly resizes the `<canvas>` to reduce visual jitter. [ae4520a](https://github.com/palantir/react-layered-chart/commit/ae4520a70153765ace918a6b1527017321184b83).

### Fixed

- `immutability-helper`'s `newContext` method is now used to prevent customizations from leaking into other node libraries that may share an instance of the library. [#86](https://github.com/palantir/react-layered-chart/issues/86).
- Added a missing prop types to `ChartProvider` for `loadDataDebounceTimeout` and `defaultChartState`. [d3f5dbd](https://github.com/palantir/react-layered-chart/commit/d3f5dbd7ac72d7e0434c9ffe69ddce6314d7d9ab).
- Specifying a `loadDataDebounceTimeout` of `0` no longer causes the chart to load synchronously on almost every change. [5932645](https://github.com/palantir/react-layered-chart/commit/593264570832db682d9c41162b90881126276bf5).

## 1.4.1 (2016-09-13)

### Added

- `SimpleLineLayer` and `BucketedLineLayer` now accept a `joinType` enumeration prop of type `JoinType` to specify if they should drawing joining lines between points directly (the default and current behavior) or using only vertical/horizontal lines with vertical-first ("leading") or vertical-last ("trailing"). [#67](https://github.com/palantir/react-layered-chart/issues/67).
- Added `loadDataDebounceTimeout` prop to `ChartProvider`. [#69](https://github.com/palantir/react-layered-chart/issues/69).

## 1.4.0

*This release was erroneous and was skipped.*

## 1.3.0 (2016-07-07)

### Changed

- `InteractionCaptureLayer`'s and `YAxisLayer`'s CSS class names were made more specific. The old class names are still present. [#54](https://github.com/palantir/react-layered-chart/issues/54).
- Changing `ChartProvider`'s `xDomain` and `seriesIds` props to a value that is reference-unequal but value-equal will no longer trigger a load. This also applies to the `setXDomain` action. [c22a4ac](https://github.com/palantir/react-layered-chart/commit/c22a4accee79a20727f6d37ad473906f47b2f3db).

### Deprecated

- `XAxisLayer`'s and `YAxisLayer`'s `font` prop is deprecated in favor of using CSS rules. [#54](https://github.com/palantir/react-layered-chart/issues/54).

## 1.2.0 (2016-07-05)

### Fixed

- Zooming too far out with an X axis no longer goes into an infinite loop. [#34](https://github.com/palantir/react-layered-chart/issues/34).
- Updating the internal value for X domain (such as through `ConnectedInteractionCaptureLayer`) no longer triggers data loads if that value is overridden by a controlled X domain. [#27](https://github.com/palantir/react-layered-chart/issues/27).

### Changed

- Non-standard `npm run dev:hot-reload` replaced with standard `npm start`. [#33](https://github.com/palantir/react-layered-chart/pull/33).
- `mergeIntervals` accepts a default argument to return in the case when no intervals are given. [#20](https://github.com/palantir/react-layered-chart/issues/20).
- `PollingResizingCanvasLayer`'s `resetCanvas` no longer automatically translates the canvas before returning it. [#49](https://github.com/palantir/react-layered-chart/issues/49).

### Added

- `CanvasContextSpy` for testing canvas-based layers cheaply. [#49](https://github.com/palantir/react-layered-chart/issues/49).
- `ConnectedSelectionBrushLayer`, replacing `ConnectedBrushLayer`. [#49](https://github.com/palantir/react-layered-chart/issues/49).

### Deprecated

- `HoverLineLayer`'s `stroke` prop deprecated in favor of `color`. [#49](https://github.com/palantir/react-layered-chart/issues/49).
- `SpanLayer`'s `color` prop deprecated in favor of `fillColor` and `borderColor`. [#49](https://github.com/palantir/react-layered-chart/issues/49).
- `SpanLayer`'s data's individual color settings are deprecated. Use the color settings directly on `SpanLayer`'s props. [#49](https://github.com/palantir/react-layered-chart/issues/49).
- `BrushLayer` deprecated in favor of `SpanLayer`. [#49](https://github.com/palantir/react-layered-chart/issues/49).
- `ConnectedBrushLayer` deprecated in favor of the new `ConnectedSelectionBrushLayer`. [#49](https://github.com/palantir/react-layered-chart/issues/49).

## 1.1.0 (2016-06-09)

### Fixed

- `ChartProvider`'s `loadData` receives the underlying Y domains instead of the controlled Y domains, preventing an infinitely-growing Y domain in some situations. [80f0e54](https://github.com/palantir/react-layered-chart/commit/80f0e54e90083b54b8ac41a74940374794005152).

### Added

- `PollingResizingCanvasLayer` replaces `AutoresizingCanvasLayer` with a simpler, less error-prone API. [#30](https://github.com/palantir/react-layered-chart/pull/30).

### Deprecated

- `AutoresizingCanvasLayer` is deprecated in favor of `PollingResizingCanvasLayer`. [#30](https://github.com/palantir/react-layered-chart/pull/30).

## 1.0.0 (2016-06-08)

Initial semver release.
