import {
  parseQuery,
  dslBuilder,
  createFields,
  multiDslBuilder,
} from './parse.ts';

describe('parseQuery', () => {
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

describe('dslBuilder', () => {
  test('create a valid query string from a query object', () => {
    expect(
      multiDslBuilder([{ value: 'hello', status: 'and', visible: true }], {
        i: [{ status: 'included', field: 'field', visible: true }],
      })
    ).toEqual({ i: 'field:("hello")' });
  });

  test('create a valid query string with multiple fields', () => {
    expect(
      multiDslBuilder([{ value: 'hello', status: 'and', visible: true }], {
        i: [
          { status: 'included', field: 'field', visible: true },
          { status: 'included', field: 'field2', visible: true },
        ],
      })
    ).toEqual({ i: 'field:("hello") AND field2:("hello")' });
  });

  test('create a valid query string with more complex queries', () => {
    expect(
      multiDslBuilder(
        [{ value: 'hello world', status: 'and', visible: true }],
        {
          i: [
            { status: 'included', field: 'field', visible: true },
            { status: 'included', field: 'field2', visible: true },
          ],
        }
      )
    ).toEqual({ i: 'field:("hello world") AND field2:("hello world")' });
  });

  test('create a valid query string with multiple fields and queries', () => {
    expect(
      multiDslBuilder(
        [
          { value: 'hello world', status: 'and', visible: true },
          { value: 'hello everyone', status: 'and', visible: true },
        ],
        {
          i: [
            { field: 'field', status: 'included', visible: true },
            { field: 'field2', status: 'included', visible: true },
          ],
        }
      )
    ).toEqual({
      i:
        'field:("hello world" OR "hello everyone") AND field2:("hello world" OR "hello everyone")',
    });
  });

  test('create a valid query string with some NOTs', () => {
    expect(
      multiDslBuilder(
        [
          { value: 'hello world', status: 'not', visible: true },
          { value: 'hello everyone', status: 'and', visible: true },
        ],
        {
          i: [
            { field: 'field', status: 'included', visible: true },
            { field: 'field2', status: 'included', visible: true },
          ],
        }
      )
    ).toEqual({
      i:
        'field:(-"hello world" OR "hello everyone") AND field2:(-"hello world" OR "hello everyone")',
    });
  });

  test('create a valid query string excluding certain fields', () => {
    expect(
      multiDslBuilder(
        [
          { value: 'hello world', status: 'not', visible: true },
          { value: 'hello everyone', status: 'and', visible: true },
        ],
        {
          i: [
            { field: 'field', status: 'included', visible: true },
            { field: 'field2', status: 'included', visible: true },
            { field: 'field3', status: 'excluded', visible: true },
          ],
        }
      )
    ).toEqual({
      i:
        'field:(-"hello world" OR "hello everyone") AND field2:(-"hello world" OR "hello everyone") AND NOT field3:(-"hello world" OR "hello everyone")',
    });
  });

  test('create a valid query string with all fields marked default', () => {
    expect(
      multiDslBuilder(
        [
          { value: 'hello world', status: 'and', visible: true },
          { value: 'hello everyone', status: 'and', visible: true },
        ],
        {
          i: [
            { field: 'field', status: 'default', visible: true },
            { field: 'field2', status: 'default', visible: true },
            { field: 'field3', status: 'default', visible: true },
          ],
          i2: [
            { field: 'field_2', status: 'default', visible: true },
            { field: 'field2_2', status: 'default', visible: true },
            { field: 'field3_2', status: 'default', visible: true },
          ],
        }
      )
    ).toEqual({
      i: '"hello world" OR "hello everyone"',
      i2: '"hello world" OR "hello everyone"',
    });
  });

  test('create a valid query string from excluded and default fields', () => {
    expect(
      multiDslBuilder(
        [
          { value: 'hello world', status: 'and', visible: true },
          { value: 'hello everyone', status: 'and', visible: true },
        ],
        {
          i: [
            { field: 'field', status: 'excluded', visible: true },
            { field: 'field2', status: 'default', visible: true },
            { field: 'field3', status: 'default', visible: true },
          ],
          i2: [
            { field: 'field_2', status: 'excluded', visible: true },
            { field: 'field2_2', status: 'default', visible: true },
            { field: 'field3_2', status: 'default', visible: true },
          ],
        }
      )
    ).toEqual({
      i:
        '"hello world" OR "hello everyone" AND NOT field:("hello world" OR "hello everyone")',
      i2:
        '"hello world" OR "hello everyone" AND NOT field_2:("hello world" OR "hello everyone")',
    });
  });
});

describe('createFields', () => {
  const subject = {
    i1: {
      name: ['title_of_organisation', 'name_of_organisation', 'name_of_group'],
      location: [
        'placeName_country_organisation',
        'placeName_region_organisation',
        'placeName_state_organisation',
      ],
      category: ['type_of_organisation', 'terms_category_organisation'],
    },
    i2: {
      name: [
        'title_of_organisation2',
        'name_of_organisation2',
        'name_of_group2',
      ],
      location: [
        'placeName_country_organisation2',
        'placeName_region_organisation2',
        'placeName_state_organisation2',
      ],
      category: ['type_of_organisation2', 'terms_category_organisation2'],
    },
  };
  test('create full field list from subject list and a field map', () => {
    expect(
      createFields(subject, [
        { field: 'name', status: 'included', visible: true },
        { field: 'location', status: 'excluded', visible: true },
        { field: 'category', status: 'default', visible: true },
      ])
    ).toEqual({
      i1: [
        { field: 'title_of_organisation', status: 'included', visible: true },
        { field: 'name_of_organisation', status: 'included', visible: true },
        { field: 'name_of_group', status: 'included', visible: true },
        {
          field: 'placeName_country_organisation',
          status: 'excluded',
          visible: true,
        },
        {
          field: 'placeName_region_organisation',
          status: 'excluded',
          visible: true,
        },
        {
          field: 'placeName_state_organisation',
          status: 'excluded',
          visible: true,
        },
        { field: 'type_of_organisation', status: 'default', visible: true },
        {
          field: 'terms_category_organisation',
          status: 'default',
          visible: true,
        },
      ],
      i2: [
        { field: 'title_of_organisation2', status: 'included', visible: true },
        { field: 'name_of_organisation2', status: 'included', visible: true },
        { field: 'name_of_group2', status: 'included', visible: true },
        {
          field: 'placeName_country_organisation2',
          status: 'excluded',
          visible: true,
        },
        {
          field: 'placeName_region_organisation2',
          status: 'excluded',
          visible: true,
        },
        {
          field: 'placeName_state_organisation2',
          status: 'excluded',
          visible: true,
        },
        { field: 'type_of_organisation2', status: 'default', visible: true },
        {
          field: 'terms_category_organisation2',
          status: 'default',
          visible: true,
        },
      ],
    });
  });
});
