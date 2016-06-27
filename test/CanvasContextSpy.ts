// From Typescript's lib.d.ts as of be2ca35b004f2079464fdca454c08a5019020260.
const PROPERTY_NAMES = [
  'fillStyle',
  'font',
  'globalAlpha',
  'globalCompositeOperation',
  'lineCap',
  'lineDashOffset',
  'lineJoin',
  'lineWidth',
  'miterLimit',
  'msFillRule',
  'msImageSmoothingEnabled',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'strokeStyle',
  'textAlign',
  'textBaseline',
  'mozImageSmoothingEnabled',
  'webkitImageSmoothingEnabled',
  'oImageSmoothingEnabled'
];

const METHOD_NAMES = [
  'arc',
  'arcTo',
  'beginPath',
  'bezierCurveTo',
  'clearRect',
  'clip',
  'closePath',
  'createImageData',
  'createLinearGradient',
  'createPattern',
  'createRadialGradient',
  'drawImage',
  'ellipse',
  'fill',
  'fillRect',
  'fillText',
  'getImageData',
  'getLineDash',
  'isPointInPath',
  'lineTo',
  'measureText',
  'moveTo',
  'putImageData',
  'quadraticCurveTo',
  'rect',
  'restore',
  'rotate',
  'save',
  'scale',
  'setLineDash',
  'setTransform',
  'stroke',
  'strokeRect',
  'strokeText',
  'transform',
  'translate'
];

export interface PropertySet {
  property: string;
  value: any;
}

export interface MethodCall {
  method: string;
  arguments: any[];
}

interface CanvasContextSpyExtensions {
  operations: (PropertySet | MethodCall)[];
  prototype: MergedCanvasContext;
  new(): MergedCanvasContext;
}

// I don't know why this roundabout type definition works and simpler definitions
// don't, but it took me a while to get here so we're going to leave it, weird
// though it is (and it requires an annoying `typeof` on definitions to work).
type MergedCanvasContext = CanvasRenderingContext2D & CanvasContextSpyExtensions;

class CanvasContextSpy {
  public operations = [];
}

PROPERTY_NAMES.forEach(property => {
  Object.defineProperty(CanvasContextSpy.prototype, property, {
    set: function(value: any) {
      this.operations.push({ property, value });
    }
  });
});

METHOD_NAMES.forEach(method => {
  CanvasContextSpy.prototype[method] = function() {
    this.operations.push({ method, arguments: Array.prototype.slice.apply(arguments) });
  };
});

export default CanvasContextSpy as any as MergedCanvasContext;
