# react-layered-chart Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

### Changes

- Non-standard `npm run dev:hot-reload` replaced with standard `npm start`. [#33](https://github.com/palantir/react-layered-chart/pull/33).

## 1.1.0 (2016-06-09)

### Fixed

- `ChartProvider`'s `loadData` receives the underlying Y domains instead of the controlled Y domains, preventing an infinitely-growing Y domain in some situations. [80f0e54](https://github.com/palantir/react-layered-chart/commit/80f0e54e90083b54b8ac41a74940374794005152).

### Added

- `PollingResizingCanvasLayer` replaces `AutoresizingCanvasLayer` with a simpler, less error-prone API. [#30](https://github.com/palantir/react-layered-chart/pull/30).

### Deprecated

- `AutoresizingCanvasLayer` is deprecated in favor of `PollingResizingCanvasLayer`. [#30](https://github.com/palantir/react-layered-chart/pull/30).

## 1.0.0 (2016-06-08)

Initial semver release.