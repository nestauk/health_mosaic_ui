import { getIdsByTerms } from './domain';

/* terms */

test('getIdsByTerms', () => {
  const array = [{
    'terms': ['a', 'b', 'c', 'd', 'e'                         ], 'id': '0'
  }, {
    'terms': [          'c', 'd',     'f', 'g'                ], 'id': '1'
  }, {
    'terms': ['a',                    'f',    'h'             ], 'id': '2'
  }, {
    'terms': [     'b', 'c',          'f'                     ], 'id': '3'
  }, {
    'terms': ['a',           'd', 'e'                         ], 'id': '4'
  }, {
    'terms': [                    'e',            'i', 'l'    ], 'id': '5'
  }, {
    'terms': ['a',           'd',           'g',          'm' ], 'id': '6'
  }, {
    'terms': [    'b',            'e', 'f',            'l'    ], 'id': '7'
  }, {
    'terms': ['a',                     'f',               'm' ], 'id': '8'
  }];
  const received = getIdsByTerms(array);
  const expected = {
    a: ['0', '2', '4', '6', '8'],
    b: ['0', '3', '7'],
    c: ['0', '1', '3'],
    d: ['0', '1', '4', '6'],
    e: ['0', '4', '5', '7'],
    f: ['1', '2', '3', '7', '8'],
    g: ['1', '6'],
    h: ['2'],
    i: ['5'],
    l: ['5', '7'],
    m: ['6', '8'],
  };
  expect(received).toEqual(expected);
});
