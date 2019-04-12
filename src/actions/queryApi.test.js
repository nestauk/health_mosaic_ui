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
    const output = makeQuery(
      {
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
          {
            field: 'title_of_organisation2',
            status: 'included',
            visible: true,
          },
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
      },
      ['title']
    );
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
