declare var process: { env: { NODE_ENV: string } };

// I don't depend on the d3 typings because as of this writing they're way out of date and I don't want to rewrite all
// of the scale typings for a single method right now.
declare module 'd3-scale' {
  var scale: any;
  export = scale;
}

declare module 'd3-ease' {
  var ease: any;
  export = ease;
}

declare module 'd3-interpolate' {
  var interpolate: any;
  export = interpolate;
}
