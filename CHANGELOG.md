# react-layered-chart Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

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
