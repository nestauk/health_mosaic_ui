import { exactAmountBins } from './array';

test('makeExactAmountBins identity', () => {
  const array = [10, 10, 10, 2];

  const bins10 = exactAmountBins(array, 10);
  const expected10 = [
    { range: [ 2, 2.8 ], values: [ 2 ] },
    { range: [ 2.8, 3.5999999999999996 ], values: [] },
    { range: [ 3.5999999999999996, 4.3999999999999995 ], values: [] },
    { range: [ 4.3999999999999995, 5.199999999999999 ], values: [] },
    { range: [ 5.199999999999999, 5.999999999999999 ], values: [] },
    { range: [ 5.999999999999999, 6.799999999999999 ], values: [] },
    { range: [ 6.799999999999999, 7.599999999999999 ], values: [] },
    { range: [ 7.599999999999999, 8.399999999999999 ], values: [] },
    { range: [ 8.399999999999999, 9.2 ], values: [] },
    { range: [ 9.2, 10 ], values: [ 10, 10, 10 ] }
  ];
  expect(bins10).toEqual(expected10);

  const bins5 = exactAmountBins(array, 5);
  const expected5 = [
    { range: [ 2, 3.6 ], values: [ 2 ] },
    { range: [ 3.6, 5.2 ], values: [] },
    { range: [ 5.2, 6.800000000000001 ], values: [] },
    { range: [ 6.800000000000001, 8.4 ], values: [] },
    { range: [ 8.4, 10 ], values: [ 10, 10, 10 ] }
  ];
  expect(bins5).toEqual(expected5);
});

test('makeExactAmountBins accessor', () => {
  const array = [{v: 10}, {v: 10}, {v: 10}, {v: 2}];

  const bins10 = exactAmountBins(array, 10, x => x.v);
  const expected10 = [
    { range: [ 2, 2.8 ], values: [ {v: 2} ] },
    { range: [ 2.8, 3.5999999999999996 ], values: [] },
    { range: [ 3.5999999999999996, 4.3999999999999995 ], values: [] },
    { range: [ 4.3999999999999995, 5.199999999999999 ], values: [] },
    { range: [ 5.199999999999999, 5.999999999999999 ], values: [] },
    { range: [ 5.999999999999999, 6.799999999999999 ], values: [] },
    { range: [ 6.799999999999999, 7.599999999999999 ], values: [] },
    { range: [ 7.599999999999999, 8.399999999999999 ], values: [] },
    { range: [ 8.399999999999999, 9.2 ], values: [] },
    { range: [ 9.2, 10 ], values: [ {v: 10}, {v: 10}, {v: 10} ] }
  ];
  expect(bins10).toEqual(expected10);

  const bins5 = exactAmountBins(array, 5, x => x.v);
  const expected5 = [
    { range: [ 2, 3.6 ], values: [ {v: 2} ] },
    { range: [ 3.6, 5.2 ], values: [] },
    { range: [ 5.2, 6.800000000000001 ], values: [] },
    { range: [ 6.800000000000001, 8.4 ], values: [] },
    { range: [ 8.4, 10 ], values: [ {v: 10}, {v: 10}, {v: 10} ] }
  ];
  expect(bins5).toEqual(expected5);

  const bins5Maxed1 = exactAmountBins(array, 5, x => Math.min(x.v, 5));
  const expectedBins5Maxed1 = [
    { range: [ 2, 2.6 ], values: [ {v: 2} ] },
    { range: [ 2.6, 3.2 ], values: [] },
    { range: [ 3.2, 3.8000000000000003 ], values: [] },
    { range: [ 3.8000000000000003, 4.4 ], values: [] },
    { range: [ 4.4, 5 ], values: [ {v: 10}, {v: 10}, {v: 10} ] }
  ];
  expect(bins5Maxed1).toEqual(expectedBins5Maxed1);
});
