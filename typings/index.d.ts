import * as React from 'react';

export interface IndexBounds {
  firstIndex: number;
  lastIndex: number;
}

export interface Range {
  min: number;
  max: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface DataBucket {
  startTime: number;
  endTime: number;
  minValue: number;
  maxValue: number;
  firstValue: number;
  lastValue: number;
}

export type OnSizeChange = (dimensions: Dimensions) => void;
export type HexColor = string;
export type BooleanMouseEventHandler = (event: React.MouseEvent) => boolean;
export type ScaleFunction = Function; // TODO: This should be a d3 scale function.

export namespace mixins {
  interface MixinAndDecorator {
    mixin: React.Mixin<any, any>;
    decorator: ClassDecorator;
  }

  export var CanvasRender: MixinAndDecorator;
  export var AnimateProps: MixinAndDecorator;
  export var PixelRatioContext: MixinAndDecorator;

  export var mixinToDecorator: (mixin: React.Mixin<any, any>) => ClassDecorator;
}

export namespace layers {
  interface WithDomains {
    xDomain: Range;
    yDomain: Range;
  }

  interface WithColor {
    color?: HexColor;
  }

  interface WithYScale {
    yScale?: ScaleFunction;
  }

  interface WithData<D> {
    data: D[];
  }

  interface WithClassName {
    className?: string;
  }

  interface AutoresizingCanvasLayerProps extends React.Props<AutoresizingCanvasLayerClass>, WithClassName {
    onSizeChange: OnSizeChange;
  }
  interface AutoresizingCanvasLayerClass extends React.ComponentClass<AutoresizingCanvasLayerProps> { }
  export var AutoresizingCanvasLayer: AutoresizingCanvasLayerClass;

  interface BarLayerProps extends React.Props<BarLayerClass>, WithDomains, WithColor, WithData<{
    timeSpan: Range;
    value: number;
  }> { }
  interface BarLayerClass extends React.ComponentClass<BarLayerProps> { }
  export var BarLayer: BarLayerClass;

  interface BrushLayerProps extends React.Props<BrushLayerClass> {
    xDomain: Range;
    selection?: Range;
    stroke?: HexColor;
    fill?: HexColor;
  }
  interface BrushLayerClass extends React.ComponentClass<BrushLayerProps> { }
  export var BrushLayer: BrushLayerClass;

  export interface BucketedLineLayerProps extends React.Props<BucketedLineLayerClass>, WithDomains, WithYScale, WithColor, WithData<DataBucket> { }
  interface BucketedLineLayerClass extends React.ComponentClass<BucketedLineLayerProps> { }
  export var BucketedLineLayer: BucketedLineLayerClass;

  interface HoverLayerProps extends React.Props<HoverLayerClass> {
    hover?: number;
    xDomain: Range;
    stroke?: HexColor;
  }
  interface HoverLayerClass extends React.ComponentClass<HoverLayerProps> { }
  export var HoverLayer: HoverLayerClass;

  interface InteractionCaptureLayerProps extends React.Props<InteractionCaptureLayerClass> {
    xDomain: Range;
    shouldZoom?: BooleanMouseEventHandler;
    shouldPan?: BooleanMouseEventHandler;
    shouldBrush?: BooleanMouseEventHandler;
    onZoom?: (factor: number, anchorBias: number) => void;
    onPan?: (logicalUnits: number) => void;
    onBrush?: (logicalUnitRange?: Range) => void;
    onHover?: (logicalPosition?: number) => void;
  }
  interface InteractionCaptureLayerClass extends React.ComponentClass<InteractionCaptureLayerProps> { }
  export var InteractionCaptureLayer: InteractionCaptureLayerClass;

  interface PointLayerProps extends React.Props<PointLayerClass>, WithDomains, WithYScale, WithColor, WithData<DataPoint> {
    radius?: number;
  }
  interface PointLayerClass extends React.ComponentClass<PointLayerProps> { }
  export var PointLayer: PointLayerClass;

  interface SimpleLineLayerProps extends React.Props<SimpleLineLayerClass>, WithDomains, WithYScale, WithColor, WithData<DataPoint> { }
  interface SimpleLineLayerClass extends React.ComponentClass<SimpleLineLayerProps> { }
  export var SimpleLineLayer: SimpleLineLayerClass;

  interface TimeSpanLayerProps extends React.Props<TimeSpanLayerClass>, WithColor, WithData<{
    timeSpan: Range;
    color?: HexColor;
  }> {
    xDomain: Range;
  }
  interface TimeSpanLayerClass extends React.ComponentClass<TimeSpanLayerProps> { }
  export var TimeSpanLayer: TimeSpanLayerClass;

  interface XAxisLayerProps extends React.Props<XAxisLayerClass> {
    xDomain: Range;
    color?: HexColor;
    font?: string;
  }
  interface XAxisLayerClass extends React.ComponentClass<XAxisLayerProps> { }
  export var XAxisLayer: XAxisLayerClass;

  interface YAxisLayerProps extends React.Props<YAxisLayerClass> {
    yDomains: Range[];
    scales?: ScaleFunction[];
    ticks?: ((yDomain: Range) => number | number)[];
    colors?: HexColor[];
    font?: string;
  }
  interface YAxisLayerClass extends React.ComponentClass<YAxisLayerProps> { }
  export var YAxisLayer: YAxisLayerClass;

}

export namespace propTypes {
  export var range: React.Requireable<any>;
  export var dataPoint: React.Requireable<any>;
}

export namespace util {
  export var getBoundsForInstantaeousData: (timestampedData: any[], timeRange: Range, timestampPath?: string) => IndexBounds;
  export var getBoundsForTimeSpanData: (timeSpanData: any[], timeRange: Range, minPath?: string, maxPath?: string) => IndexBounds;
  export var resolvePan: (timeRange: Range, delta: number) => Range;
  export var resolveZoom: (timeRange: Range, factor: number, anchorBias: number) => Range;
}

interface StackProps extends React.Props<StackClass> {
  className?: string;
  pixelRatio?: number;
  onSizeChange?: OnSizeChange;
}
interface StackClass extends React.ComponentClass<StackProps> { }
export var Stack: StackClass;

