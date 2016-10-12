import * as should from 'should';
import * as sinon from 'sinon';

import { Interval, SeriesData } from '../src/core/interfaces';
import { TBySeriesId, LoadedSeriesData, DataLoader } from '../src/connected/interfaces';
import { chainLoaders } from '../src/connected/loaderUtils';

describe('(loader utils)', () => {
  describe('chainLoaders', () => {
    const SERIES_IDS = [ 'a', 'b' ];
    const X_DOMAIN: Interval = { min: 0, max: 1 };
    const Y_DOMAINS: TBySeriesId<Interval> = {
      a: { min: 2, max: 3 },
      b: { min: 4, max: 5 }
    };
    const CHART_PIXEL_WIDTH = 100;
    const CURRENT_DATA: TBySeriesId<SeriesData> = {
      a: [ 1, 2, 3 ],
      b: [ 4, 5, 6 ]
    };
    const CURRENT_LOADED_DATA: TBySeriesId<LoadedSeriesData> = {
      a: {
        data: [ 1, 2, 3 ],
        yDomain: { min: 2, max: 3 }
      },
      b: {
        data: [ 4, 5, 6 ],
        yDomain: { min: 4, max: 5 }
      }
    };
    const CONTEXT = { foo: 'bar' };

    let loaderStub1: Sinon.SinonStub;
    let loaderStub2: Sinon.SinonStub;
    let loader: DataLoader;

    beforeEach(() => {
      loaderStub1 = sinon.stub();
      loaderStub2 = sinon.stub();
      loader = chainLoaders(loaderStub1, loaderStub2);
    });

    function callWithArgs(loader: DataLoader) {
      return loader(
        SERIES_IDS,
        X_DOMAIN,
        Y_DOMAINS,
        CHART_PIXEL_WIDTH,
        CURRENT_DATA,
        CURRENT_LOADED_DATA,
        CONTEXT
      );
    }

    it('should forward all parameters as-is to each loader, except series IDs', () => {
      loaderStub1.onFirstCall().returns({});
      loaderStub2.onFirstCall().returns({});

      callWithArgs(loader);

      const args = [
        SERIES_IDS,
        X_DOMAIN,
        Y_DOMAINS,
        CHART_PIXEL_WIDTH,
        CURRENT_DATA,
        CURRENT_LOADED_DATA,
        CONTEXT
      ];

      loaderStub1.calledOnce.should.be.true();
      loaderStub1.firstCall.args.should.deepEqual(args);
      loaderStub2.calledOnce.should.be.true();
      loaderStub2.firstCall.args.should.deepEqual(args);
    });

    it('should call the loaders in order', () => {
      const callOrder = [];

      loader = chainLoaders(
        () => {
          callOrder.push(0);
          return {};
        },
        () => {
          callOrder.push(1);
          return {};
        }
      );

      callWithArgs(loader);

      callOrder.should.deepEqual([ 0, 1 ]);
    });

    it('should pass through only series IDs that earlier loaders didn\'t handle', () => {
      loaderStub1.onFirstCall().returns({
        a: Promise.resolve()
      });
      loaderStub2.onFirstCall().returns({});

      callWithArgs(loader);

      loaderStub2.calledOnce.should.be.true();
      loaderStub2.firstCall.args[0].should.deepEqual([ 'b' ]);
    });

    it('should automatically create rejected promises for any unhandled series IDs', () => {
      loaderStub1.onFirstCall().returns({});
      loaderStub2.onFirstCall().returns({});

      const { a, b } = callWithArgs(loader);

      return Promise.all([
        a.then(
          () => { throw new Error('promise should have been rejected'); },
          () => {}
        )
      ,
        b.then(
          () => { throw new Error('promise should have been rejected'); },
          () => {}
        )
      ]);
    });
  });
});