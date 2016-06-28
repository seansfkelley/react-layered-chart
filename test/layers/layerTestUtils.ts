import { PointDatum } from '../../src/core/interfaces';
import { MethodCall } from '../../src/test-util/CanvasContextSpy';

export function point(xValue: number, yValue: number): PointDatum {
  return { xValue, yValue };
}

export function method(method: string, args: any[]): MethodCall {
  return { method, arguments: args };
}
