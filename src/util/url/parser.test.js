import {
  applyRulesFromQuery,
  createTerms,
  createFields,
  extractParentContents,
  extractTermsFields,
  makeRuleset,
  parseQueryUrl,
  parseSelectionUrl,
  detectType,
  convertNumericList,
  convertStringList,
} from './parser.ts';

test('extractParentContents', () => {
  const queryString = '(one,-two,in:one,-two)(three,-four,in:one,-two)';
  const rulesets = extractParentContents(queryString);

  expect(rulesets).toEqual(['one,-two,in:one,-two', 'three,-four,in:one,-two']);
});

test('extractParentContents', () => {
  const queryString = '(one,-two, in:one,-two)(three,-four,in:one,-two)';
  const rulesets = extractParentContents(queryString);

  expect(rulesets).toEqual(['one,-two,in:one,-two', 'three,-four,in:one,-two']);
});

test('extractTermsFields', () => {
  const string = 'one,-two,in:one,two';
  const termsAndFields = extractTermsFields(string);

  expect(termsAndFields).toEqual(['one,-two', 'one,two']);
});

test('extractTermsFields: fields are optional', () => {
  const string = 'one,-two';
  const termsAndFields = extractTermsFields(string);

  expect(termsAndFields).toEqual(['one,-two', '']);
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

test('makeRuleset', () => {
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
    selected: false,
  });
});

test('parseQueryUrl', () => {
  const urlString = '(one,-two,in:body,-place)(three,-four,in:place,-body)';
  const expected = [
    {
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
            status: 'included',
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
            status: 'default',
            options: false,
            disabled: false,
          },
        ],
      },
      options: false,
      disabled: false,
      selected: true,
    },
    {
      terms: [
        {
          term: 'three',
          status: 'and',
        },
        {
          term: 'four',
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
            status: 'included',
            options: false,
            disabled: false,
          },
        ],
        content: [
          {
            field: 'body',
            status: 'excluded',
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
            status: 'default',
            options: false,
            disabled: false,
          },
        ],
      },
      options: false,
      disabled: false,
      selected: false,
    },
  ];
  expect(parseQueryUrl(urlString)).toEqual(expected);
});

test('detectType', () => {
  const types = [
    ['key1', 'one,two and a,three'],
    ['key2', '10..20'],
    ['key3', '1,2..3,4'],
  ];

  const expected = [
    ['key1', 'one,two and a,three', 'include'],
    ['key2', '10..20', 'within'],
    ['key3', '1,2..3,4', 'within'],
  ];

  expect(types.map(v => detectType(v))).toEqual(expected);
});

test('convertNumericList', () => {
  const inputs = [['key2', '10..20', 'within'], ['key3', '1,2..3,4', 'within']];
  const expected = [
    ['key2', { type: 'within', value: [10, 20] }],
    ['key3', { type: 'within', value: [[1, 2], [3, 4]] }],
  ];
  expect(inputs.map(v => convertNumericList(v))).toEqual(expected);
});

test('convertStringList', () => {
  const input = ['key1', 'one,two+and+a,three', 'include'];
  const expected = [
    'key1',
    {
      type: 'include',
      value: ['one', 'two and a', 'three'],
    },
  ];
  expect(convertStringList(input)).toEqual(expected);
});

test('parseSelectionUrl', () => {
  const selectionUrl =
    '(prop_one:ONE,TWO)(prop_two:10..20)(prop_three:some_value)';

  const expected = {
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

  expect(parseSelectionUrl(selectionUrl)).toEqual(expected);
});

test('parseSelectionUrl 2', () => {
  const selectionUrl =
    '(prop_one:ONE,TWO)(prop_two:10..20)(prop_three:some_value)(prop_four:1,2..3,4)';

  const expected = {
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
    prop_four: {
      type: 'within',
      value: [[1, 2], [3, 4]],
    },
  };

  expect(parseSelectionUrl(selectionUrl)).toEqual(expected);
});
