import { PointDatum } from '../../src';

import { MethodCall } from '../CanvasContextSpy';

export function point(xValue: number, yValue: number): PointDatum {
  return { xValue, yValue };
}

export function method(method: string, args: any[]): MethodCall {
  return { method, arguments: args };
}
