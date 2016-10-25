import CanvasContextSpy from '../src/test-util/CanvasContextSpy';
import { expect } from 'chai';

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

    expect(spy.properties).to.deep.equal([
      { property: 'fillStyle', value: '#000' }
    ]);
  });

  it('should support calling methods', () => {
    spy.scale(0, 0);

    expect(spy.calls).to.deep.equal([
      { method: 'scale', arguments: [ 0, 0 ] }
    ]);
  });

  it('should provide property sets and method calls in the order they happen via \'operations\'', () => {
    doABunchOfStuff(spy);

    expect(spy.operations).to.deep.equal([
      { property: 'fillStyle', value: '#000' },
      { method: 'scale', arguments: [ 0, 0 ] },
      { property: 'lineWidth', value: 1 },
      { method: 'save', arguments: [] }
    ]);
  });

  it('should track only property sets in the order they happen via \'properties\'', () => {
    doABunchOfStuff(spy);

    expect(spy.properties).to.deep.equal([
      { property: 'fillStyle', value: '#000' },
      { property: 'lineWidth', value: 1 }
    ]);
  });

  it('should track only method calls in the order they happen via \'calls\'', () => {
    doABunchOfStuff(spy);

    expect(spy.calls).to.deep.equal([
      { method: 'scale', arguments: [ 0, 0 ] },
      { method: 'save', arguments: [] }
    ]);
  });

  it('should exclude calls using callsOmit', () => {
    doABunchOfStuff(spy);

    expect(spy.callsOmit('scale')).to.deep.equal([
      { method: 'save', arguments: [] }
    ]);
  });

  it('should include calls using callsOnly', () => {
    doABunchOfStuff(spy);

    expect(spy.callsOnly('scale')).to.deep.equal([
      { method: 'scale', arguments: [ 0, 0 ] }
    ]);
  });
});
