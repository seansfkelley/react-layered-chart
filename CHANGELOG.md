# react-layered-chart Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

### Fixed

- Zooming too far out with an X axis no longer goes into an infinite loop. [#34](https://github.com/palantir/react-layered-chart/issues/34).
- Updating the internal value for X domain (such as through `ConnectedInteractionCaptureLayer`) no longer triggers data loads if that value is overridden by a controlled X domain. [#27](https://github.com/palantir/react-layered-chart/issues/27).

### Changed

- Non-standard `npm run dev:hot-reload` replaced with standard `npm start`. [#33](https://github.com/palantir/react-layered-chart/pull/33).
- `mergeIntervals` accepts a default argument to return in the case when no intervals are given. [#20](https://github.com/palantir/react-layered-chart/issues/20).
- `HoverLineLayer`'s `stroke` prop deprecated in favor of `color`.
- `SpanLayer`'s `color` prop deprecated in favor of `fillColor` and `borderColor`.
- `BrushLayer` deprecated in favor of `SpanLayer`.
- `ConnectedBrushLayer` deprecated in favor of the new `ConnectedSelectionBrushLayer`.
- `PollingResizingCanvasLayer`'s `resetCanvas` no longer automatically translates the canvas before returning it.

### Added

- `ConnectedSelectionBrushLayer`, replacing `ConnectedBrushLayer`.

## 1.1.0 (2016-06-09)

### Fixed

- `ChartProvider`'s `loadData` receives the underlying Y domains instead of the controlled Y domains, preventing an infinitely-growing Y domain in some situations. [80f0e54](https://github.com/palantir/react-layered-chart/commit/80f0e54e90083b54b8ac41a74940374794005152).

### Added

- `PollingResizingCanvasLayer` replaces `AutoresizingCanvasLayer` with a simpler, less error-prone API. [#30](https://github.com/palantir/react-layered-chart/pull/30).

### Deprecated

- `AutoresizingCanvasLayer` is deprecated in favor of `PollingResizingCanvasLayer`. [#30](https://github.com/palantir/react-layered-chart/pull/30).

## 1.0.0 (2016-06-08)

Initial semver release.
