import {
  filterFields,
  filterRuleset,
  filterQuery,
  queryToUrlString,
  stringifyFields,
  stringifyTerms,
} from './urlParser.ts';

import { query } from './urlParser.data.js';

test('filterFields', () => {
  const fields = query['0'].uiQuery[0].fields.subject;
  const expected = [
    {
      field: 'name',
      status: 'included',
      options: false,
      disabled: false,
    },
    {
      field: 'place',
      status: 'excluded',
      options: false,
      disabled: false,
    },
  ];
  const filteredFields = fields.filter(filterFields);

  expect(filteredFields).toEqual(expected);
});

test('filterRuleset', () => {
  const ruleset = query['0'].uiQuery;
  const expected = [].concat(query['0'].uiQuery[0], query['0'].uiQuery[1]);

  const filteredRuleset = ruleset.filter(filterRuleset);

  expect(filteredRuleset).toEqual(expected);
});

test('stringifyTerms', () => {
  const terms = [
    { status: 'and', term: 'one' },
    { status: 'not', term: 'two' },
    { status: 'not', term: 'one two three' },
    { status: 'and', term: 'one two three' },
  ];
  const expected = ['one', '-two', '-one+two+three', 'one+two+three'];

  const stringifiedTerms = terms.map(stringifyTerms);

  expect(stringifiedTerms).toEqual(expected);
});

test('stringifyFields', () => {
  const terms = [
    { status: 'include', field: 'field1' },
    { status: 'excluded', field: 'field2' },
  ];
  const expected = ['field1', '-field2'];

  const stringifiedFields = terms.map(stringifyFields);

  expect(stringifiedFields).toEqual(expected);
});

test('filterQuery', () => {
  const ruleset = query['0'].uiQuery;
  const expected = [
    {
      terms: [
        {
          status: 'and',
          term: 'heart plant',
        },
        {
          status: 'not',
          term: 'disease',
        },
      ],
      fields: [
        {
          field: 'name',
          status: 'included',
          options: false,
          disabled: false,
        },
        {
          field: 'place',
          status: 'excluded',
          options: false,
          disabled: false,
        },
      ],
    },
    {
      terms: [
        {
          status: 'and',
          term: 'one',
        },
        {
          status: 'not',
          term: 'two',
        },
        {
          status: 'not',
          term: 'one two three',
        },
        {
          status: 'and',
          term: 'one two three',
        },
      ],
      fields: [
        {
          field: 'name',
          status: 'included',
          options: false,
          disabled: false,
        },
        {
          field: 'place',
          status: 'excluded',
          options: false,
          disabled: false,
        },
      ],
    },
  ];

  expect(filterQuery(ruleset)).toEqual(expected);
});

test('queryToUrlString', () => {
  const ruleset = query['0'].uiQuery;
  const expected =
    '(heart+plant,-disease,in:name,-place)(one,-two,-one+two+three,one+two+three,in:name,-place)';

  expect(queryToUrlString(filterQuery(ruleset))).toBe(expected);
});
