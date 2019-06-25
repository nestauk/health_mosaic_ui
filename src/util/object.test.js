import { makeSelectionFilter } from './object';

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

/* include */

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

test('makeSelectionFilter: include: single key, empty value', () => {
  const selections = {
    country: {type: 'include', value: []},
  };
  const filter = makeSelectionFilter(selections);
  const filtered = filter(items);
  expect(filtered).toEqual(items);
});

test('makeSelectionFilter: include: multiple keys, some empty value', () => {
  const selections = {
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

/* within */

test('makeSelectionFilter: within: single key', () => {
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

test('makeSelectionFilter: within: multiple keys', () => {
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
