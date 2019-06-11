import {
  applyRulesFromQuery,
  createTerms,
  createFields,
  extractRulesets,
  extractTermsFields,
  filterFields,
  filterRuleset,
  filterQuery,
  makeRuleset,
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

test('extractRulesets', () => {
  const queryString = '(one,-two,in:one,-two)(three,-four,in:one,-two)';
  const rulesets = extractRulesets(queryString);

  expect(rulesets).toEqual(['one,-two,in:one,-two', 'three,-four,in:one,-two']);
});

test('extractTermsFields', () => {
  const string = 'one,-two,in:one,two';
  const termsAndFields = extractTermsFields(string);

  expect(termsAndFields).toEqual(['one,-two', 'one,two']);
});

test('createTerms', () => {
  const string = 'one,-two';
  const terms = createTerms(string);

  expect(terms).toEqual([
    { term: 'one', status: 'and' },
    { term: 'two', status: 'not' },
  ]);
});

test('createFields', () => {
  const string = 'one,-two';
  const terms = createFields(string);

  expect(terms).toEqual([
    { field: 'one', status: 'included' },
    { field: 'two', status: 'excluded' },
  ]);
});

test('makeTermsFields', () => {
  const rulesetStrings = ['one,-two', 'one,-two'];
  const ruleset = makeRuleset(rulesetStrings);

  expect(ruleset).toEqual([
    [{ term: 'one', status: 'and' }, { term: 'two', status: 'not' }],
    [
      { field: 'one', status: 'included' },
      { field: 'two', status: 'excluded' },
    ],
  ]);
});

test('applyRulesFromQuery', () => {
  const newRuleset = [
    [{ term: 'one', status: 'and' }, { term: 'two', status: 'not' }],
    [
      { field: 'terms', status: 'included' },
      { field: 'place', status: 'excluded' },
    ],
  ];

  const finalRuleset = applyRulesFromQuery(newRuleset);
  expect(finalRuleset).toEqual({
    terms: [
      {
        term: 'one',
        status: 'and',
      },
      {
        term: 'two',
        status: 'not',
      },
    ],
    fields: {
      subject: [
        {
          field: 'name',
          status: 'default',
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
      content: [
        {
          field: 'body',
          status: 'default',
          options: false,
          disabled: false,
        },
        {
          field: 'summary',
          status: 'default',
          options: false,
          disabled: false,
        },
        {
          field: 'terms',
          status: 'included',
          options: false,
          disabled: false,
        },
      ],
    },
    options: false,
    disabled: false,
    selected: true,
  });
});
