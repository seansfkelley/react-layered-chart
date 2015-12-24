export function makeFakeLineData(endTime, xExtent, yExtent) {
  const data = [];
  for (let i = 0; i < 100; ++i) {
    data.push({ timestamp: endTime - Math.random() * xExtent, value: Math.random() * yExtent });
  }
  data.sort((a, b) => a.timestamp - b.timestamp);
  return data;
}

export function makeFakeEventData(endTime, xExtent, yExtent) {
  const data = [];
  for (let i = 0; i < 10; ++ i) {
    const min = endTime - Math.random() * xExtent;
    data.push({ timeSpan: { min, max: min + (1000 * 60 * 60 * (24 * Math.random())) }});
  }
  return data;
}

export function makeFakeBarData(endTime, xExtent, yExtent) {
  const data = [];
  for (let i = 0; i < 10; ++ i) {
    const min = endTime - Math.random() * xExtent;
    data.push({ timeSpan: { min, max: min + (1000 * 60 * 60 * (24 * Math.random())) }, value: Math.random() * yExtent });
  }
  return data;
}

export function makeFakeBucketedData(endTime, xExtent, yExtent, bucketWidth = 1000 * 60 * 60 * 24) {
  const data = [];
  let startTime = endTime - xExtent;
  while (startTime < endTime) {
    const endTime = startTime + bucketWidth;
    if (Math.random() > 0.9) {
      startTime = endTime;
      continue;
    }

    const actualStartTime = startTime + Math.random() * bucketWidth * 0.1;
    const actualEndTime = endTime - Math.random() * bucketWidth * 0.1;

    let value1;
    let value2;
    if (data.length) {
      value1 = data[data.length - 1].bounds.minValue + (Math.random() - 0.5) * yExtent * 0.1;
      value2 = data[data.length - 1].bounds.maxValue + (Math.random() - 0.5) * yExtent * 0.1;
    } else {
      value1 = Math.random() * yExtent * 0.1 + yExtent / 2;
      value2 = Math.random() * yExtent * 0.1 + yExtent / 2;
    }

    const minValue = Math.min(value1, value2);
    const maxValue = Math.max(value1, value2);

    data.push({
      bounds: {
        startTime,
        endTime,
        minValue,
        maxValue
      },
      earliestPoint: {
        timestamp: actualStartTime,
        value: Math.random() * (maxValue - minValue) + minValue
      },
      latestPoint: {
        timestamp: actualEndTime,
        value: Math.random() * (maxValue - minValue) + minValue
      }
    });

    startTime = endTime;
  }
  return data;
}

export default {
  makeFakeLineData,
  makeFakeEventData,
  makeFakeBarData,
  makeFakeBucketedData
};
