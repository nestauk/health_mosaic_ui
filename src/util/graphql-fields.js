import * as _ from 'lamb';

const makeFieldExist = field => ({ exists: { field } });

// prettier-ignore

const fieldMaps = {
  body: [
    'textBody_descriptive_organisation',
    'textBody_descriptive_group',
    'textBody_descriptive_project',
  ],
  city: [
    'placeName_city_organisation',
    'placeName_city_group',
    'placeName_city_organisation',
  ],
  continent: [
    'placeName_continent_organisation',
    'placeName_continent_group',
    'placeName_continent_organisation',
  ],
  continent_id: [
    'id_continent_organisation',
    'id_continent_group',
    'id_of_continent',
  ],
  cost: [
    'cost_of_funding',
    'cost_total_project'
  ],
  cost_ref: [
    'cost_of_funding',
    'cost_total_project'
  ],
  countries_ids: [
    'terms_of_countryTags',
    'terms_of_countryTags',
    'terms_of_countryTags',
  ],
  country: [
    'placeName_country_organisation',
    'placeName_country_group',
    'placeName_country_organisation',
  ],
  country_id: [
    'id_iso2_country',
    'id_iso2_country',
    'id_iso2_country'
  ],
  currency: [
    'currency_of_funding',
    'currency_total_cost'
  ],
  end: [
    'date_death_organisation',
    'date_end_project',
  ],
  funders: [
    'terms_of_funders',
    'terms_of_funders'
  ],
  is_duplicate: ['booleanFlag_duplicate_abstract'],
  is_health_related: ['booleanFlag_health_organisation'],
  location: [
    'coordinate_of_city',
    'coordinate_of_group',
    'coordinate_of_organisation',
  ],
  name: [
    'name_of_organisation',
    'name_of_group',
    'title_of_organisation',
  ],
  novelty: [
    'cost_of_funding',
    'count_member_group',
    'cost_total_project'
  ],
  region: ['placeName_region_organisation'],
  sdg_labels: [
    '_terms_sdg_summary',
    '_terms_sdg_description',
    '_terms_sdg_abstract',
  ],
  start: [
    'date_birth_organisation',
    'date_start_group',
    'date_start_project',
  ],
  state: [
    'placeName_state_organisation',
    '_placeName_state_group',
    'placeName_state_organisation',
  ],
  state_id: [
    'id_state_organisation',
    'id_state_organisation',
  ],
  summary: [
    'textBody_summary_organisation',
    'textBody_abstract_project',
  ],
  terms: [
    'terms_mesh_description',
    'terms_topics_group',
    'terms_mesh_abstract',
  ],
  title: ['title_of_project'],
  url: [
    'url_of_organisation',
    'url_of_group'
  ],
  type: ['type_of_entity']
};

const makeFieldMatch = ({ field }) => makeFieldExist(field);

export const makeQuery = querystring => {
  return {
    bool: {
      must: [{ query_string: { query: querystring } }],
    },
  };
};

/* eslint-disable indent */
export const makeRequiredFields = requiredFields => ({
  bool: {
    should: Object.keys(requiredFields).map(index => ({
      bool: {
        must: requiredFields[index].map(makeFieldMatch),
        ...(index === 'NIH' // see requiredFields in config.js
          ? {
              must_not: { exists: { field: 'booleanFlag_duplicate_abstract' } },
            }
          : {}),
      },
    })),
  },
});

export const fieldMapEntry = field =>
  field.reduce((acc, next) => {
    return `${acc}if (parent._source.hasOwnProperty('${next}')) return parent._source.${next};
    `;
  }, '');

export const makeResolvers = () => {
  let resolvers = '{\n';
  for (const field in fieldMaps) {
    resolvers += `
  ${field}: (parent) => {
    ${fieldMapEntry(fieldMaps[field])}
  },`;
  }

  return `${resolvers} \n}`;
};

const fieldBuilder = (q, status) => (acc, next) =>
  acc +
  (next.status === 'excluded' ? ` ${status} NOT ` : ` ${status} `) +
  next.title +
  `:(${q})`;

const queryBuilder = (acc, next, i, arr) =>
  acc +
  (next.status === 'not' ? '-' : '') +
  `"${next.query}"` +
  (arr[i + 1] ? ' AND ' : '');

const hasIncluded = arr =>
  _.filter(arr, ({ status }) => status === 'included').length > 0;

const createFullQuery = (query, status) =>
  _.pipe([
    _.filterWith(v => v.status !== 'default'),
    _.reduceWith(fieldBuilder(query, status), ''),
  ]);

export const dslBuilder = (query, fields, status = 'AND') => {
  const q = _.reduce(query, queryBuilder, '');
  let queryString = createFullQuery(q, status)(fields);

  queryString = hasIncluded(fields) ? queryString : `${q}  ${queryString}`;
  return queryString
    .trim()
    .replace(/^AND|^OR |^OR NOT |^AND NOT/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const queryMapper = queryObject =>
  fieldMaps.name.map((v, i) =>
    queryObject.map(q => ({
      ...q,
      fields: q.fields.map(f => ({ ...f, title: fieldMaps[f.title][i] })),
    }))
  );

export const mappedQueryBuilder = (mappedQuery, logic) =>
  mappedQuery.reduce(
    (acc, next, i) =>
      `${acc} ${i ? 'OR ' : ''}` +
      next.reduce(
        (acc, { fields, values }, i2, arr2) =>
          `(${acc} ${dslBuilder(values, fields, logic)})` +
          (arr2[i2 + 1] ? ` ${logic}` : ''),
        ''
      ),
    ''
  ) + '';
