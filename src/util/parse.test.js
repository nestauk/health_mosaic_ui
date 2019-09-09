import { parseQuery } from './parse.ts';
import { dslBuilder } from './graphql-fields.js';

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
        [{ query: 'hello', status: 'and' }],
        [{ status: 'included', title: 'field' }]
      )
    ).toBe('field:("hello")');
  });

  test('create a valid query string with multiple fields', () => {
    expect(
      dslBuilder(
        [{ query: 'hello', status: 'and' }],
        [
          { status: 'included', title: 'field' },
          { status: 'included', title: 'field2' },
        ]
      )
    ).toBe('field:("hello") AND field2:("hello")');
  });

  test('create a valid query string with more complex queries', () => {
    expect(
      dslBuilder(
        [{ query: 'hello world', status: 'and' }],
        [
          { status: 'included', title: 'field' },
          { status: 'included', title: 'field2' },
        ]
      )
    ).toBe('field:("hello world") AND field2:("hello world")');
  });

  test('create a valid query string with multiple fields and queries', () => {
    expect(
      dslBuilder(
        [
          { query: 'hello world', status: 'and' },
          { query: 'hello everyone', status: 'and' },
        ],
        [
          { title: 'field', status: 'included' },
          { title: 'field2', status: 'included' },
        ]
      )
    ).toBe(
      'field:("hello world" AND "hello everyone") AND field2:("hello world" AND "hello everyone")'
    );
  });

  test('create a valid query string with some NOTs', () => {
    expect(
      dslBuilder(
        [
          { query: 'hello world', status: 'not' },
          { query: 'hello everyone', status: 'and' },
        ],
        [
          { title: 'field', status: 'included' },
          { title: 'field2', status: 'included' },
        ]
      )
    ).toBe(
      'field:(-"hello world" AND "hello everyone") AND field2:(-"hello world" AND "hello everyone")'
    );
  });

  test('create a valid query string excluding certain fields', () => {
    expect(
      dslBuilder(
        [
          { query: 'hello world', status: 'not' },
          { query: 'hello everyone', status: 'and' },
        ],
        [
          { title: 'field', status: 'included' },
          { title: 'field2', status: 'included' },
          { title: 'field3', status: 'excluded' },
        ]
      )
    ).toBe(
      'field:(-"hello world" AND "hello everyone") AND field2:(-"hello world" AND "hello everyone") AND NOT field3:(-"hello world" AND "hello everyone")'
    );
  });

  test('create a valid query string with all fields marked default', () => {
    expect(
      dslBuilder(
        [
          { query: 'hello world', status: 'and' },
          { query: 'hello everyone', status: 'and' },
        ],
        [
          { title: 'field', status: 'default' },
          { title: 'field2', status: 'default' },
          { title: 'field3', status: 'default' },
        ]
      )
    ).toBe('"hello world" AND "hello everyone"');
  });

  test('create a valid query string from excluded and default fields', () => {
    expect(
      dslBuilder(
        [
          { query: 'hello world', status: 'and' },
          { query: 'hello everyone', status: 'and' },
        ],
        [
          { title: 'field', status: 'excluded' },
          { title: 'field2', status: 'default' },
          { title: 'field3', status: 'default' },
        ]
      )
    ).toBe(
      '"hello world" AND "hello everyone" AND NOT field:("hello world" AND "hello everyone")'
    );
  });

  test('create a valid query string from excluded and default fields with OR parameter', () => {
    expect(
      dslBuilder(
        [
          { query: 'hello world', status: 'and' },
          { query: 'hello everyone', status: 'and' },
        ],
        [
          { title: 'field', status: 'excluded' },
          { title: 'field2', status: 'default' },
          { title: 'field3', status: 'default' },
        ],
        'OR'
      )
    ).toBe(
      '"hello world" AND "hello everyone" OR NOT field:("hello world" AND "hello everyone")'
    );
  });
});
