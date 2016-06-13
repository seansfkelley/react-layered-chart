# react-layered-chart Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

### Changes

- Non-standard `npm run dev:hot-reload` replaced with standard `npm start`. #33.

## 1.1.0 (2016-06-09)

### Fixed

- `ChartProvider`'s `loadData` receives the underlying Y domains instead of the controlled Y domains, preventing an infinitely-growing Y domain in some situations. 80f0e54.

### Added

- `PollingResizingCanvasLayer` replaces `AutoresizingCanvasLayer` with a simpler, less error-prone API. #30.

### Deprecated

- `AutoresizingCanvasLayer` is deprecated in favor of `PollingResizingCanvasLayer`. #30.

## 1.0.0 (2016-06-08)

Initial semver release.