import CanvasContextSpy from './CanvasContextSpy';

describe('CanvasContextSpy', () => {
  let spy: typeof CanvasContextSpy;

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  it('should support setting properties', () => {
    spy.fillStyle = '#000';

    spy.operations.should.deepEqual([
      { property: 'fillStyle', value: '#000' }
    ]);
  });

  it('should support calling methods', () => {
    spy.scale(0, 0);

    spy.operations.should.deepEqual([
      { method: 'scale', arguments: [ 0, 0 ] }
    ]);
  });

  it('should provide property sets and method calls in the order they happen', () => {
    spy.fillStyle = '#000';
    spy.scale(0, 0);
    spy.lineWidth = 1;
    spy.save();

    spy.operations.should.deepEqual([
      { property: 'fillStyle', value: '#000' },
      { method: 'scale', arguments: [ 0, 0 ] },
      { property: 'lineWidth', value: 1 },
      { method: 'save', arguments: [] }
    ]);
  });
});
