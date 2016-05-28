declare var process: { env: { NODE_ENV: string } };

// I don't depend on the d3 typings because as of this writing they don't have the proper typings for all
// of these libraries and I'm not going to go rewrite them all now.
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
