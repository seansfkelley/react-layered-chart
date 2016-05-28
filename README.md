# react-layered-chart

A high-performance canvas-based time series visualization in Typescript + React.

TODO: Example picture.

## Installation

```
npm install --save react-layered-chart
```

Be sure to include the styles from `react-layered-chart/react-layered-chart.css`. This is also specified on the `style` key in `package.json` for any toolchains that support it.

### `process.env.NODE_ENV`

In development mode, react-layered-chart logs internal state changes rather verbosely for debugging purposes. Specify the value `"production"` for `process.env.NODE_ENV` in your build to turn this off.

## Basic Usage

See also the [section on developing](#developing) to set up a page you can play around with yoruself.

## Advanced Usage

See also the [section on developing](#developing) to set up a page you can play around with yoruself.

## <a name="developing"></a>Developing

```
npm install
./hooks/install.sh
npm run dev:hot-reload
```

Then visit [localhost:8085](http://localhost:8085/) to see the example page. This runs `webpack-dev-server` on port 8085, including auto-recompilation and hot code injection.
