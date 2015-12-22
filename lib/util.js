import _ from 'lodash';
import d3 from 'd3';

export function getVisibleIndexBounds(timestampedData, domain) {
  const firstIndex = _.sortedIndex(timestampedData, { timestamp: domain.start }, 'timestamp');
  const lastIndex = _.sortedLastIndex(timestampedData, { timestamp: domain.end }, 'timestamp');

  // No data is visible!
  if (firstIndex === timestampedData.length || lastIndex === 0) {
    return { firstIndex, lastIndex };
  }

  // In the case where the data crosses a domain boundary, the sortedIndex calculations will be off by one.
  return {
    firstIndex: Math.max(0, firstIndex - 1),
    lastIndex: Math.min(timestampedData.length - 1, lastIndex + 1)
  };
}

const ANIMATION_FRAMERATE = 30;

export function animateOnce(fromValue, toValue, durationMs, onFrame) {
  const interpolator = d3.interpolate(fromValue, toValue);
  const ease = d3.ease('cubic-in-out');
  const frameCount = Math.ceil(durationMs / 1000 * ANIMATION_FRAMERATE);

  let frame = 0;
  const setIntervalId = setInterval(() => {
    onFrame(interpolator(ease(frame / frameCount)));
    frame++;
    if (frame === frameCount) {
      clearInterval(setIntervalId);
    }
  }, durationMs / frameCount);

  return () => { clearInterval(setIntervalId); };
}
