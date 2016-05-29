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

## Making Basic, Static Charts

See also the [section on developing](#developing) to set up a page you can play around with yoruself.

The core functionality of react-layered-chart is a set of "layer" components inside a `Stack` component. The simplest possible chart looks something like this:

```jsx
<Stack>
  <PointLayer
    data={MY_DATA}
    xDomain={{ min: 0, max: 100 }}
    yDomain={{ min: 0, max: 100 }}
  />
</Stack>
```

Where the `data` props is an array of objects appropriate for the particular layer (see the [implementations of the included layers](https://github.com/palantir/react-layered-chart/tree/connected-components/src/core/layers) for details).

The `xDomain` and `yDomain` props, which are common to many layers, describe which subset of the data should be rendered. Many layers also include a `yScale` for customizing the scale on the Y domain (e.g. for displaying logarithmic plots).

Including multiple layers will cause them to be stacked in the Z direction, so you can overlay multiple charts. For instance, if you want a line chart that also emphasizes each point, you could do something like the following:

```jsx
<Stack>
  <PointLayer data={DATA} .../>
  <SimpleLineLayer data={DATA} .../>
</Stack>
```

Charts made in this manner are static. See the [interactive section](#interactive) for how to make interactive charts.

## <a name="#interactive"></a>Interaction Charts

See also the [section on developing](#developing) to set up a page you can play around with yoruself.

## API Reference

## <a name="developing"></a>Developing

```
npm install
./hooks/install.sh
npm run dev:hot-reload
```

Then visit [localhost:8085](http://localhost:8085/) to see the example page. This runs `webpack-dev-server` on port 8085, including auto-recompilation and hot code injection.
