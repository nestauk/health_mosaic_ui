import {
  isValidRuleset,
  filterQuery,
  uiQueryToUrlString,
  stringifyFields,
  stringifyTerms,
  includeToString,
  withinToString,
  isToString,
  selectionToUrlString,
} from './urlBuilder.ts';

import { query } from './urlParser.data.js';

test('isValidRuleset', () => {
  const ruleset = query['0'].uiQuery;
  const expected = [].concat(query['0'].uiQuery[0], query['0'].uiQuery[1]);

  const filteredRuleset = ruleset.filter(isValidRuleset);

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

test('uiQueryToUrlString', () => {
  const ruleset = query['0'].uiQuery;
  const expected =
    '(heart+plant,-disease,in:name,-place)(one,-two,-one+two+three,one+two+three,in:name,-place)';

  expect(uiQueryToUrlString(filterQuery(ruleset))).toBe(expected);
});

test('includeToString', () => {
  const item = [
    'prop_one',
    {
      type: 'include',
      value: ['ONE', 'TWO'],
    },
  ];
  const expected = '(prop_one:ONE,TWO)';

  expect(includeToString(item)).toBe(expected);
});

test('withinToString', () => {
  const item = [
    'prop_two',
    {
      type: 'within',
      value: [10, 20],
    },
  ];
  const expected = '(prop_two:10..20)';

  expect(withinToString(item)).toBe(expected);
});

test('selectionToUrlString', () => {
  const selection = {
    prop_one: {
      type: 'include',
      value: ['ONE', 'TWO'],
    },
    prop_two: {
      type: 'within',
      value: [10, 20],
    },
    prop_three: {
      type: 'include',
      value: ['some_value'],
    },
  };

  const expected = '(prop_one:ONE,TWO)(prop_two:10..20)(prop_three:some_value)';

  expect(selectionToUrlString(selection)).toEqual(expected);
});
