import {
  exactAmountBins,
  makeBiPermutations
} from './array';

test('makeExactAmountBins – identity', () => {
  const array = [10, 10, 10, 2];

  const bins10 = exactAmountBins({
    array,
    size: 10
  });
  const expected10 = [
    { range: [ 2, 3 ], values: [ 2 ] },
    { range: [ 3, 4 ], values: [] },
    { range: [ 4, 5 ], values: [] },
    { range: [ 5, 6 ], values: [] },
    { range: [ 6, 7 ], values: [] },
    { range: [ 7, 8 ], values: [] },
    { range: [ 8, 9 ], values: [] },
    { range: [ 9, 10 ], values: [ 10, 10, 10 ] },
    { range: [ 10, 11 ], values: [] },
    { range: [ 11, 12 ], values: [] }
  ];
  expect(bins10).toEqual(expected10);

  const bins5 = exactAmountBins({
    array,
    size: 5
  });
  const expected5 = [
    { range: [ 2, 4 ], values: [ 2 ] },
    { range: [ 4, 6 ], values: [] },
    { range: [ 6, 8 ], values: [] },
    { range: [ 8, 10 ], values: [ 10, 10, 10 ] },
    { range: [ 10, 12 ], values: [] }
  ];
  expect(bins5).toEqual(expected5);
});

test('makeExactAmountBins – identity – single value', () => {
  const array = [10, 10, 10];

  const bins10 = exactAmountBins({
    array,
    size: 10
  });
  const expected10 = [
    { values: [10, 10, 10] },
  ];
  expect(bins10).toEqual(expected10);

  const bins5 = exactAmountBins({
    array,
    size: 5
  });
  const expected5 = [
    { values: [10, 10, 10] },
  ];
  expect(bins5).toEqual(expected5);
});

test('makeExactAmountBins – accessor', () => {
  const array = [{v: 10}, {v: 10}, {v: 10}, {v: 2}];

  const bins10 = exactAmountBins({
    array,
    size: 10,
    accessor: x => x.v
  });
  const expected10 = [
    { range: [ 2, 3 ], values: [ {v: 2} ] },
    { range: [ 3, 4 ], values: [] },
    { range: [ 4, 5 ], values: [] },
    { range: [ 5, 6 ], values: [] },
    { range: [ 6, 7 ], values: [] },
    { range: [ 7, 8 ], values: [] },
    { range: [ 8, 9 ], values: [] },
    { range: [ 9, 10 ], values: [ {v: 10}, {v: 10}, {v: 10} ] },
    { range: [ 10, 11 ], values: [] },
    { range: [ 11, 12 ], values: [] }
  ];
  expect(bins10).toEqual(expected10);

  const bins5 = exactAmountBins({
    array,
    size: 5,
    accessor: x => x.v
  });
  const expected5 = [
    { range: [ 2, 4 ], values: [ {v: 2} ] },
    { range: [ 4, 6 ], values: [] },
    { range: [ 6, 8 ], values: [] },
    { range: [ 8, 10 ], values: [ {v: 10}, {v: 10}, {v: 10} ] },
    { range: [ 10, 12 ], values: [] }
  ];
  expect(bins5).toEqual(expected5);

  const bins5Maxed1 = exactAmountBins({
    array,
    size: 5,
    accessor: x => Math.min(x.v, 5)
  });
  const expectedBins5Maxed1 = [
    { range: [ 2, 3 ], values: [ {v: 2} ] },
    { range: [ 3, 4 ], values: [] },
    { range: [ 4, 5 ], values: [ {v: 10}, {v: 10}, {v: 10} ] },
    { range: [ 5, 6 ], values: [] },
    { range: [ 6, 7 ], values: [] }
  ];
  expect(bins5Maxed1).toEqual(expectedBins5Maxed1);
});

test('makeExactAmountBin – interval width smaller than size', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  const bins = exactAmountBins({
    array,
    size: 4,
    interval: [2, 4]
  });
  const expected = [
    { range: [ 2, 3 ], values: [ 2, 3 ] },
    { range: [ 3, 4 ], values: [ 4 ] },
    { range: [ 4, 5 ], values: [] },
    { range: [ 5, 6 ], values: [] }
  ];
  expect(bins).toEqual(expected);
});

test('makeExactAmountBin – interval width equal to size', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const bins = exactAmountBins({
    array,
    size: 7,
    interval: [4, 11]
  });
  const expected = [
    { range: [ 4, 5 ], values: [ 4, 5 ] },
    { range: [ 5, 6 ], values: [ 6 ] },
    { range: [ 6, 7 ], values: [ 7 ] },
    { range: [ 7, 8 ], values: [ 8 ] },
    { range: [ 8, 9 ], values: [ 9 ] },
    { range: [ 9, 10 ], values: [ 10 ] },
    { range: [ 10, 11 ], values: [ 11 ] }
  ];
  expect(bins).toEqual(expected);
});

test('makeExactAmountBin – interval width greater than size', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const bins4 = exactAmountBins({
    array,
    size: 4,
    interval: [6, 13]
  });
  const expected4 = [
    { range: [ 6, 8 ], values: [ 6, 7, 8 ] },
    { range: [ 8, 10 ], values: [ 9, 10 ] },
    { range: [ 10, 12 ], values: [ 11, 12 ] },
    { range: [ 12, 14 ], values: [ 13 ] }
  ];
  expect(bins4).toEqual(expected4);

  const bins3 = exactAmountBins({
    array,
    size: 3,
    interval: [2, 16]
  });
  const expected3 = [
    { range: [ 2, 7 ], values: [ 2, 3, 4, 5, 6, 7 ] },
    { range: [ 7, 12 ], values: [ 8, 9, 10, 11, 12 ] },
    { range: [ 12, 17 ], values: [ 13, 14, 15, 16 ] }
  ];
  expect(bins3).toEqual(expected3);
});

test('makeExactAmountBin – interval width greater than size extending over the range max', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const bins = exactAmountBins({
    array,
    size: 4,
    interval: [16, 23]
  });
  const expected = [
    { range: [ 16, 18 ], values: [ 16, 17, 18 ] },
    { range: [ 18, 20 ], values: [] },
    { range: [ 20, 22 ], values: [] },
    { range: [ 22, 24 ], values: [] }
  ];
  expect(bins).toEqual(expected);
});

test('makeExactAmountBin – accessor & interval width smaller than size', () => {
  const array = [{v: 10}, {v: 4}, {v: 10}, {v: 2}];

  const bins = exactAmountBins({
    array,
    size: 4,
    accessor: x => x.v,
    interval: [2, 5]
  });
  const expected = [
    { range: [ 2, 3 ], values: [ {v: 2} ] },
    { range: [ 3, 4 ], values: [ {v: 4} ] },
    { range: [ 4, 5 ], values: [] },
    { range: [ 5, 6 ], values: [] }
  ];
  expect(bins).toEqual(expected);
});

test('makeExactAmountBin – accessor & interval width equal to size', () => {
  const array = [{v: 10}, {v: 4}, {v: 10}, {v: 2}];
  const bins = exactAmountBins({
    array,
    size: 3,
    accessor: x => x.v,
    interval: [4, 7]
  });
  const expected = [
    { range: [ 4, 5 ], values: [ {v: 4} ] },
    { range: [ 5, 6 ], values: [] },
    { range: [ 6, 7 ], values: [] }
  ];
  expect(bins).toEqual(expected);
});

test('makeExactAmountBin – accessor & interval width greater than size', () => {
  const array = [{v: 18}, {v: 4}, {v: 10}, {v: 2}];

  const bins = exactAmountBins({
    array,
    size: 4,
    accessor: x => x.v,
    interval: [6, 13]
  });
  const expected = [
    { range: [ 6, 8 ], values: [] },
    { range: [ 8, 10 ], values: [ {v: 10} ] },
    { range: [ 10, 12 ], values: [] },
    { range: [ 12, 14 ], values: [] }
  ];
  expect(bins).toEqual(expected);
});

test('makeExactAmountBin – accessor & interval width greater than size extending over the range max', () => {
  const array = [{v: 18}, {v: 4}, {v: 10}, {v: 2}];

  const bins = exactAmountBins({
    array,
    size: 4,
    accessor: x => x.v,
    interval: [8, 23]
  });
  const expected = [
    { range: [ 8, 12 ], values: [ {v: 10} ] },
    { range: [ 12, 16 ], values: [] },
    { range: [ 16, 20 ], values: [ {v: 18} ] },
    { range: [ 20, 24 ], values: [] }
  ];
  expect(bins).toEqual(expected);
});


/* permutations */

test('makeBiPermutations – of multiple values', () => {
  const array = [
    {foo: "a"},
    {foo: "b"},
    {bar: "c"},
    {bar: "d"}
  ];
  const received = makeBiPermutations(array);
  const expected = [
    [{foo: "a"}, {foo: "b"}],
    [{foo: "a"}, {bar: "c"}],
    [{foo: "a"}, {bar: "d"}],
    [{foo: "b"}, {bar: "c"}],
    [{foo: "b"}, {bar: "d"}],
    [{bar: "c"}, {bar: "d"}]
  ];
  expect(received).toEqual(expected);
});

test('makeBiPermutations – of a single value', () => {
  const array = [{foo: "a"}];
  const received = makeBiPermutations(array);
  const expected = [];
  expect(received).toEqual(expected);
});
