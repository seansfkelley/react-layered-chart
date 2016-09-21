# react-layered-chart Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

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
