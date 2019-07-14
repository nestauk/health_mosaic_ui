import { makeSelectionFilter, objectToValuesCountArray } from './object';

const items = [
  {country: 'CA', fruit: 'apple', price: 1, distance: 1},
  {country: 'CA', fruit: 'kiwi', price: 2, distance: 2},
  {country: 'CA', fruit: 'orange', price: 3, distance: 3},
  {country: 'ES', fruit: 'kiwi', price: 4, distance: 4},
  {country: 'ES', fruit: 'orange', price: 5, distance: 5},
  {country: 'FR', fruit: 'orange', price: 6, distance: 6},
  {country: 'GB', fruit: 'apple', price: 7, distance: 7},
  {fruit: 'orange', price: 8},
  {fruit: 'apple'},
];

test('makeSelectionFilter: no selections', () => {
  const selections = {};
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  expect(filtered).toEqual(items);
});

/* makeSelectionFilter: include */

test('makeSelectionFilter: include: single key, single value', () => {
  const selections = {
    country: {type: 'include', value: ['CA']}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {country: 'CA', fruit: 'apple', price: 1, distance: 1},
    {country: 'CA', fruit: 'kiwi', price: 2, distance: 2},
    {country: 'CA', fruit: 'orange', price: 3, distance: 3},
  ];
  expect(filtered).toEqual(expected);
});

test('makeSelectionFilter: include: single key, multiple values', () => {
  const selections = {
    country: {type: 'include', value: ['CA', 'ES']}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {country: 'CA', fruit: 'apple', price: 1, distance: 1},
    {country: 'CA', fruit: 'kiwi', price: 2, distance: 2},
    {country: 'CA', fruit: 'orange', price: 3, distance: 3},
    {country: 'ES', fruit: 'kiwi', price: 4, distance: 4},
    {country: 'ES', fruit: 'orange', price: 5, distance: 5},
  ];
  expect(filtered).toEqual(expected);
});

test('makeSelectionFilter: include: multiple keys', () => {
  const selections = {
    country: {type: 'include', value: ['CA', 'ES']},
    fruit: {type: 'include', value: ['orange', 'apple']}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {country: 'CA', fruit: 'apple', price: 1, distance: 1},
    {country: 'CA', fruit: 'orange', price: 3, distance: 3},
    {country: 'ES', fruit: 'orange', price: 5, distance: 5},
  ];
  expect(filtered).toEqual(expected);
});

test('makeSelectionFilter: include: single key, undefined value', () => {
  const items = [{country: 'CA'}, {country: 'ES'}];
  const selections = {
    country: {type: 'include'},
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  expect(filtered).toEqual(items);
});

test('makeSelectionFilter: include: single key, empty value', () => {
  const selections = {
    country: {type: 'include', value: []},
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  expect(filtered).toEqual(items);
});

test('makeSelectionFilter: include: multiple keys, some empty/undefined value', () => {
  const selections = {
    price: {type: 'include'},
    country: {type: 'include', value: []},
    fruit: {type: 'include', value: ['orange', 'apple']}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {country: 'CA', fruit: 'apple', price: 1, distance: 1},
    {country: 'CA', fruit: 'orange', price: 3, distance: 3},
    {country: 'ES', fruit: 'orange', price: 5, distance: 5},
    {country: 'FR', fruit: 'orange', price: 6, distance: 6},
    {country: 'GB', fruit: 'apple', price: 7, distance: 7},
    {fruit: 'orange', price: 8},
    {fruit: 'apple'},
  ];
  expect(filtered).toEqual(expected);
});

/* makeSelectionFilter: within range */

test('makeSelectionFilter: within range: single key', () => {
  const selections = {
    price: {type: 'within', value: [1, 4]}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {country: 'CA', fruit: 'apple', price: 1, distance: 1},
    {country: 'CA', fruit: 'kiwi', price: 2, distance: 2},
    {country: 'CA', fruit: 'orange', price: 3, distance: 3},
    {country: 'ES', fruit: 'kiwi', price: 4, distance: 4},
  ];
  expect(filtered).toEqual(expected);
});

test('makeSelectionFilter: within range: multiple keys', () => {
  const selections = {
    price: {type: 'within', value: [1, 4]},
    distance: {type: 'within', value: [3, 7]}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {country: 'CA', fruit: 'orange', price: 3, distance: 3},
    {country: 'ES', fruit: 'kiwi', price: 4, distance: 4},
  ];
  expect(filtered).toEqual(expected);
});

/* makeSelectionFilter: within bounds */

test('makeSelectionFilter: within bounds: single key', () => {
  const items = [
    {location: {lon: 0.25, lat: 0.15}}, // pass
    {location: {lon: 0.5, lat: 0.5}}, // pass
    {location: {lon: -0.5, lat: 0.5}},
    {location: {lon: 1.2, lat: 1.5}},
    {location: {lon: -0.5, lat: -1}},
  ];
  const selections = {
    location: {type: 'within', value: [[0, 0], [1, 1]]}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {location: {lon: 0.25, lat: 0.15}},
    {location: {lon: 0.5, lat: 0.5}},
  ];
  expect(filtered).toEqual(expected);
});

test('makeSelectionFilter: within bounds: multiple keys', () => {
  const items = [
    {location: {lon: 0.25, lat: 0.15}, position: {lon: 1, lat: 1}}, // pass
    {location: {lon: 0.5, lat: 0.5}, position: {lon: 3, lat: 3}},
    {location: {lon: -0.5, lat: 0.5}, position: {lon: 1, lat: 1}},
    {location: {lon: 1.2, lat: 1.5}, position: {lon: 1, lat: 1}},
    {location: {lon: -0.5, lat: -1}, position: {lon: 1, lat: 1}},
  ];
  const selections = {
    location: {type: 'within', value: [[0, 0], [1, 1]]},
    position: {type: 'within', value: [[0.5, 0.5], [2, 2]]}
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  const expected = [
    {location: {lon: 0.25, lat: 0.15}, position: {lon: 1, lat: 1}}
  ];
  expect(filtered).toEqual(expected);
});

/* objectToValuesCountArray */

test('objectToValuesCountArray', () => {
  const object = {
    a: ['a', 'gg'],
    b: ['ad', 'g', 'y']
  };
  const received = objectToValuesCountArray(object);
  const expected = [
    {key: 'b', value: 3},
    {key: 'a', value: 2}
  ];
  expect(received).toEqual(expected);
});
