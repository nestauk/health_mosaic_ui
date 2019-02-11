import { parseInput, querify } from './parse';

describe('parseInput', () => {
  test('it should parse simple queries', () => {
    expect(parseInput(['one, two, three'])).toEqual([
      [
        { status: 'and', value: 'one' },
        { status: 'and', value: 'two' },
        { status: 'and', value: 'three' },
      ],
    ]);
  });

  test('it should parse slightly less simple queries', () => {
    expect(parseInput(['one two, three, four five'])).toEqual([
      [
        { status: 'and', value: 'one two' },
        { status: 'and', value: 'three' },
        { status: 'and', value: 'four five' },
      ],
    ]);
  });

  test('it should parse queries with excluded values', () => {
    expect(parseInput(['one two, three, -four five'])).toEqual([
      [
        { status: 'and', value: 'one two' },
        { status: 'and', value: 'three' },
        { status: 'not', value: 'four five' },
      ],
    ]);
  });

  test('it should parse queries that target specific fields', () => {
    expect(
      parseInput(['fieldone:(one), fieldtwo:(two), fieldthree:(three)'])
    ).toEqual([
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
          ],
        },
        {
          field: 'fieldtwo',
          queries: [
            {
              status: 'and',
              value: 'two',
            },
          ],
        },
        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'three',
            },
          ],
        },
      ],
    ]);
  });

  test('it should parse queries that target specific fields with multiple terms', () => {
    expect(
      parseInput([
        'fieldone:(one, two, three), fieldtwo:(four, five), fieldthree:(six)',
      ])
    ).toEqual([
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
            {
              status: 'and',
              value: 'two',
            },
            {
              status: 'and',
              value: 'three',
            },
          ],
        },
        {
          field: 'fieldtwo',
          queries: [
            {
              status: 'and',
              value: 'four',
            },
            {
              status: 'and',
              value: 'five',
            },
          ],
        },
        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'six',
            },
          ],
        },
      ],
    ]);
  });

  test('it should parse queries that target specific fields with multiple terms including negated values', () => {
    expect(
      parseInput([
        'fieldone:(one, -two, three), fieldtwo:(four, -five), fieldthree:(six)',
      ])
    ).toEqual([
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
            {
              status: 'not',
              value: 'two',
            },
            {
              status: 'and',
              value: 'three',
            },
          ],
        },
        {
          field: 'fieldtwo',
          queries: [
            {
              status: 'and',
              value: 'four',
            },
            {
              status: 'not',
              value: 'five',
            },
          ],
        },
        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'six',
            },
          ],
        },
      ],
    ]);
  });

  test('it should parse queries that target specific fields and normal queries', () => {
    expect(
      parseInput([
        'fieldone:(one, -two, three), hello, -friend, fieldthree:(six), two terms',
      ])
    ).toEqual([
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
            {
              status: 'not',
              value: 'two',
            },
            {
              status: 'and',
              value: 'three',
            },
          ],
        },

        {
          status: 'and',
          value: 'hello',
        },
        {
          status: 'not',
          value: 'friend',
        },

        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'six',
            },
          ],
        },
        {
          status: 'and',
          value: 'two terms',
        },
      ],
    ]);
  });

  test('it should handle field names with underscores', () => {
    expect(parseInput(['placeName_country_organisation:(united)'])).toEqual([
      [
        {
          field: 'placeName_country_organisation',
          queries: [{ status: 'and', value: 'united' }],
        },
      ],
    ]);
  });

  test('it should handle field queries with no parens', () => {
    expect(parseInput(['field:united'])).toEqual([
      [
        {
          field: 'field',
          queries: [{ status: 'and', value: 'united' }],
        },
      ],
    ]);
  });
});

describe('querifyObject', () => {
  test('it should transform a basic query array into a valid ES DSL string query', () => {
    const obj = [
      [
        { status: 'and', value: 'one' },
        { status: 'and', value: 'two' },
        { status: 'and', value: 'three' },
      ],
    ];

    expect(querify(obj)).toBe('((one two three))');
  });

  test('it should transform a query array with fields into a valid ES DSL string query', () => {
    const obj = [
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
          ],
        },
        {
          field: 'fieldtwo',
          queries: [
            {
              status: 'and',
              value: 'two',
            },
          ],
        },
        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'three',
            },
          ],
        },
      ],
    ];

    expect(querify(obj)).toBe(
      '((fieldone:(one) fieldtwo:(two) fieldthree:(three)))'
    );
  });

  test('it should transform more complex query array into valid ES DSL string queries', () => {
    const obj = [
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
            {
              status: 'not',
              value: 'two',
            },
            {
              status: 'and',
              value: 'three',
            },
          ],
        },

        {
          status: 'and',
          value: 'hello',
        },
        {
          status: 'not',
          value: 'friend',
        },

        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'six',
            },
          ],
        },
        {
          status: 'and',
          value: 'two terms',
        },
      ],
    ];

    expect(querify(obj)).toBe(
      '((fieldone:(one -two three) hello -friend fieldthree:(six) two terms))'
    );
  });

  test('it should transform sets of complex query arrays into valid ES DSL string queries', () => {
    const obj = [
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
            {
              status: 'not',
              value: 'two',
            },
            {
              status: 'and',
              value: 'three',
            },
          ],
        },

        {
          status: 'and',
          value: 'hello',
        },
        {
          status: 'not',
          value: 'friend',
        },

        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'six',
            },
          ],
        },
        {
          status: 'and',
          value: 'two terms',
        },
      ],
      [
        {
          field: 'fieldone',
          queries: [
            {
              status: 'and',
              value: 'one',
            },
            {
              status: 'not',
              value: 'two',
            },
            {
              status: 'and',
              value: 'three',
            },
          ],
        },

        {
          status: 'and',
          value: 'hello',
        },
        {
          status: 'not',
          value: 'friend',
        },

        {
          field: 'fieldthree',
          queries: [
            {
              status: 'and',
              value: 'six',
            },
          ],
        },
        {
          status: 'and',
          value: 'two terms',
        },
      ],
    ];

    expect(querify(obj)).toBe(
      '((fieldone:(one -two three) hello -friend fieldthree:(six) two terms) OR (fieldone:(one -two three) hello -friend fieldthree:(six) two terms))'
    );
  });
});
