import { parseQuery, dslBuilder, createFields } from './parse.ts';

describe.skip('parseQuery', () => {
  test('parse simple queries', () => {
    expect(parseQuery({ value: 'one, two, three' })).toEqual({
      value: [
        { status: 'and', value: 'one' },
        { status: 'and', value: 'two' },
        { status: 'and', value: 'three' },
      ],
    });
  });

  test('parse slightly less simple queries', () => {
    expect(parseQuery({ value: 'one two, three, four five' })).toEqual({
      value: [
        { status: 'and', value: 'one two' },
        { status: 'and', value: 'three' },
        { status: 'and', value: 'four five' },
      ],
    });
  });

  test('parse queries with excluded values', () => {
    expect(parseQuery({ value: 'one two, three, -four five' })).toEqual({
      value: [
        { status: 'and', value: 'one two' },
        { status: 'and', value: 'three' },
        { status: 'not', value: 'four five' },
      ],
    });
  });
});

describe.skip('dslBuilder', () => {
  test('create a valid query string from a query object', () => {
    expect(
      dslBuilder(
        [{ value: 'hello', status: 'and' }],
        [{ status: 'included', field: 'field' }]
      )
    ).toBe('field:("hello")');
  });

  test('create a valid query string with multiple fields', () => {
    expect(
      dslBuilder(
        [{ value: 'hello', status: 'and' }],
        [
          { status: 'included', field: 'field' },
          { status: 'included', field: 'field2' },
        ]
      )
    ).toBe('field:("hello") AND field2:("hello")');
  });

  test('create a valid query string with more complex queries', () => {
    expect(
      dslBuilder(
        [{ value: 'hello world', status: 'and' }],
        [
          { status: 'included', field: 'field' },
          { status: 'included', field: 'field2' },
        ]
      )
    ).toBe('field:("hello world") AND field2:("hello world")');
  });

  test('create a valid query string with multiple fields and queries', () => {
    expect(
      dslBuilder(
        [
          { value: 'hello world', status: 'and' },
          { value: 'hello everyone', status: 'and' },
        ],
        [
          { field: 'field', status: 'included' },
          { field: 'field2', status: 'included' },
        ]
      )
    ).toBe(
      'field:("hello world" OR "hello everyone") AND field2:("hello world" OR "hello everyone")'
    );
  });

  test('create a valid query string with some NOTs', () => {
    expect(
      dslBuilder(
        [
          { value: 'hello world', status: 'not' },
          { value: 'hello everyone', status: 'and' },
        ],
        [
          { field: 'field', status: 'included' },
          { field: 'field2', status: 'included' },
        ]
      )
    ).toBe(
      'field:(-"hello world" OR "hello everyone") AND field2:(-"hello world" OR "hello everyone")'
    );
  });

  test('create a valid query string excluding certain fields', () => {
    expect(
      dslBuilder(
        [
          { value: 'hello world', status: 'not' },
          { value: 'hello everyone', status: 'and' },
        ],
        [
          { field: 'field', status: 'included' },
          { field: 'field2', status: 'included' },
          { field: 'field3', status: 'excluded' },
        ]
      )
    ).toBe(
      'field:(-"hello world" OR "hello everyone") AND field2:(-"hello world" OR "hello everyone") AND NOT field3:(-"hello world" OR "hello everyone")'
    );
  });

  test('create a valid query string with all fields marked default', () => {
    expect(
      dslBuilder(
        [
          { value: 'hello world', status: 'and' },
          { value: 'hello everyone', status: 'and' },
        ],
        [
          { field: 'field', status: 'default' },
          { field: 'field2', status: 'default' },
          { field: 'field3', status: 'default' },
        ]
      )
    ).toBe('"hello world" OR "hello everyone"');
  });

  test('create a valid query string from excluded and default fields', () => {
    expect(
      dslBuilder(
        [
          { value: 'hello world', status: 'and' },
          { value: 'hello everyone', status: 'and' },
        ],
        [
          { field: 'field', status: 'excluded' },
          { field: 'field2', status: 'default' },
          { field: 'field3', status: 'default' },
        ]
      )
    ).toBe(
      '"hello world" OR "hello everyone" AND NOT field:("hello world" OR "hello everyone")'
    );
  });
});

describe.skip('createFields', () => {
  const subject = {
    name: ['title_of_organisation', 'name_of_organisation', 'name_of_group'],
    location: [
      'placeName_country_organisation',
      'placeName_region_organisation',
      'placeName_state_organisation',
    ],
    category: ['type_of_organisation', 'terms_category_organisation'],
  };
  test('create full field list from subject list and a field map', () => {
    expect(
      createFields(subject, [
        { field: 'name', status: 'included' },
        { field: 'location', status: 'excluded' },
        { field: 'category', status: 'default' },
      ])
    ).toEqual([
      { field: 'title_of_organisation', status: 'included' },
      { field: 'name_of_organisation', status: 'included' },
      { field: 'name_of_group', status: 'included' },
      { field: 'placeName_country_organisation', status: 'excluded' },
      { field: 'placeName_region_organisation', status: 'excluded' },
      { field: 'placeName_state_organisation', status: 'excluded' },
      { field: 'type_of_organisation', status: 'default' },
      { field: 'terms_category_organisation', status: 'default' },
    ]);
  });
});
