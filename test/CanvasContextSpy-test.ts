import CanvasContextSpy from './CanvasContextSpy';

describe('CanvasContextSpy', () => {
  // TODO: Typescript can't find this name for some reason.
  let spy: any;

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  it('should support setting properties', () => {
    spy.fillStyle = '#000';

    spy.operations.should.deepEqual([
      { 'property': 'fillStyle', value: '#000' }
    ]);
  });

  it('should support calling methods', () => {
    spy.scale(0, 0);

    spy.operations.should.deepEqual([
      { method: 'scale', arguments: [ 0, 0 ] }
    ]);
  });
});
