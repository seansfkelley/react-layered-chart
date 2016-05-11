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

  interface AutoresizingCanvasLayerProps extends WithClassName {
    onSizeChange: OnSizeChange;
  }
  export var AutoresizingCanvasLayer: React.ComponentClass<AutoresizingCanvasLayerProps>;

  interface BarLayerProps extends WithDomains, WithColor, WithData<{
    timeSpan: Range;
    value: number;
  }> { }
  export var BarLayer: React.ComponentClass<BarLayerProps>;

  interface BrushLayerProps {
    xDomain: Range;
    selection?: Range;
    stroke?: HexColor;
    fill?: HexColor;
  }
  export var BrushLayer: React.ComponentClass<BrushLayerProps>;

  export interface BucketedLineLayerProps extends WithDomains, WithYScale, WithColor, WithData<DataBucket> { }
  export var BucketedLineLayer: React.ComponentClass<BucketedLineLayerProps>;

  interface HoverLayerProps {
    hover?: number;
    xDomain: Range;
    stroke?: HexColor;
  }
  export var HoverLayer: React.ComponentClass<HoverLayerProps>;

  interface InteractionCaptureLayerProps {
    xDomain: Range;
    shouldZoom?: BooleanMouseEventHandler;
    shouldPan?: BooleanMouseEventHandler;
    shouldBrush?: BooleanMouseEventHandler;
    onZoom?: (factor: number, anchorBias: number) => void;
    onPan?: (logicalUnits: number) => void;
    onBrush?: (logicalUnitRange?: Range) => void;
    onHover?: (logicalPosition?: number) => void;
    zoomSpeed?: number;
  }
  export var InteractionCaptureLayer: React.ComponentClass<InteractionCaptureLayerProps>;

  interface PointLayerProps extends WithDomains, WithYScale, WithColor, WithData<DataPoint> {
    radius?: number;
  }
  export var PointLayer: React.ComponentClass<PointLayerProps>

  interface SimpleLineLayerProps extends WithDomains, WithYScale, WithColor, WithData<DataPoint> { }
  export var SimpleLineLayer: React.ComponentClass<SimpleLineLayerProps>;

  interface TimeSpanLayerProps extends WithColor, WithData<{
    timeSpan: Range;
    color?: HexColor;
  }> {
    xDomain: Range;
  }
  export var TimeSpanLayer: React.ComponentClass<TimeSpanLayerProps>;

  interface XAxisLayerProps {
    xDomain: Range;
    scale?: ScaleFunction;
    color?: HexColor;
    font?: string;
  }
  export var XAxisLayer: React.ComponentClass<XAxisLayerProps>;

  interface YAxisLayerProps {
    yDomains: Range[];
    scales?: ScaleFunction[];
    ticks?: (((yDomain: Range) => number[]) | number[])[];
    colors?: HexColor[];
    font?: string;
    backgroundColor?: string;
  }
  export var YAxisLayer: React.ComponentClass<YAxisLayerProps>;

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

interface StackProps {
  className?: string;
  pixelRatio?: number;
}
export var Stack: React.ComponentClass<StackProps>;

