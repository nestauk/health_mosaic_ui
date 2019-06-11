import {
  applyRulesFromQuery,
  createTerms,
  createFields,
  extractRulesets,
  extractTermsFields,
  makeRuleset,
  parseQueryUrl,
} from './urlParser.ts';

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
