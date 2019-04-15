import { makeQuery } from './queryApi.js';

describe('makeQuery', () => {
  test('build a query with no required fields', () => {
    const output = makeQuery('heart');
    const expected = {
      bool: {
        must: [{ query_string: { default_operator: 'AND', query: 'heart' } }],
        must_not: [{ exists: { field: 'booleanFlag_duplicate_abstract' } }],
      },
    };
    expect(output).toEqual(expected);
  });

  test('build a query with required fields', () => {
    const output = makeQuery('heart');

    const expected = {
      bool: {
        must: [
          { query_string: { default_operator: 'AND', query: 'heart' } },
          {
            regexp: {
              title: '.+',
            },
          },
          {
            exists: {
              field: 'title',
            },
          },
        ],
        must_not: [{ exists: { field: 'booleanFlag_duplicate_abstract' } }],
      },
    };
    expect(output).toEqual(expected);
  });
});
