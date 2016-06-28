import CanvasContextSpy from './CanvasContextSpy';

describe('CanvasContextSpy', () => {
  let spy: typeof CanvasContextSpy;

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function doABunchOfStuff(spy: typeof CanvasContextSpy) {
    spy.fillStyle = '#000';
    spy.scale(0, 0);
    spy.lineWidth = 1;
    spy.save();
  }

  it('should support setting properties', () => {
    spy.fillStyle = '#000';

    spy.properties.should.deepEqual([
      { property: 'fillStyle', value: '#000' }
    ]);
  });

  it('should support calling methods', () => {
    spy.scale(0, 0);

    spy.calls.should.deepEqual([
      { method: 'scale', arguments: [ 0, 0 ] }
    ]);
  });

  it('should provide property sets and method calls in the order they happen via \'operations\'', () => {
    doABunchOfStuff(spy);

    spy.operations.should.deepEqual([
      { property: 'fillStyle', value: '#000' },
      { method: 'scale', arguments: [ 0, 0 ] },
      { property: 'lineWidth', value: 1 },
      { method: 'save', arguments: [] }
    ]);
  });

  it('should track only property sets in the order they happen via \'properties\'', () => {
    doABunchOfStuff(spy);

    spy.properties.should.deepEqual([
      { property: 'fillStyle', value: '#000' },
      { property: 'lineWidth', value: 1 }
    ]);
  });

  it('should track only method calls in the order they happen via \'calls\'', () => {
    doABunchOfStuff(spy);

    spy.calls.should.deepEqual([
      { method: 'scale', arguments: [ 0, 0 ] },
      { method: 'save', arguments: [] }
    ]);
  });
});
