import { endpointNIH_index } from '../config';

const makeFieldExist = field => ({ exists: { field } });

// current

// https://github.com/nestauk/nesta/blob/health2/nesta/production/schemas/tier_1/aliases/health_scanner.json

const fieldMaps = {
  body: ['textBody_descriptive_project', 'textBody_descriptive_organisation'],
  city: ['placeName_city_organisation', 'placeName_city_organisation'],
  continent: [
    'placeName_continent_organisation',
    'placeName_continent_organisation',
  ],
  cost_ref: ['cost_USD2018_project', 'cost_USD2018_org'],
  country: ['placeName_country_organisation', 'placeName_country_organisation'],
  countries_ids: [
    'terms_of_countryTags',
    'terms_of_countryTags',
  ],
  countries_names: [
    'terms_countries_description',
    'terms_countries_description',
  ],
  country_id: ['id_iso2_country', 'id_iso2_country'],
  end: ['date_end_project', 'date_death_organisation'],
  location: ['coordinate_of_organisation', 'coordinate_of_city'],
  name: ['title_of_organisation', 'name_of_organisation'],
  novelty: ['rank_rhodonite_abstract', 'rank_rhodonite_abstract'],
  region: ['placeName_region_organisation', 'placeName_region_organisation'],
  sdg_labels: ['_terms_sdg_abstract', '_terms_sdg_summary'],
  start: ['date_start_project', 'date_birth_organisation'],
  state: ['placeName_state_organisation', 'placeName_state_organisation'],
  summary: ['textBody_abstract_project', 'textBody_summary_organisation'],
  terms: ['terms_mesh_abstract', '_terms_mesh_description'],
  // title: ['title_of_project'], // TODO add title
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
        ...(index === endpointNIH_index
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

const fieldBuilder = (fieldArr, q, type = '') =>
  fieldArr.reduce((acc, next, arr, i) => {
    // if (!next.visible) return acc;
    return (
      acc +
      (type === 'exclude' ? 'NOT ' : '') +
      next +
      `:(${q})` +
      (arr[i + 1] ? ' OR ' : '')
    );
  }, '');

const queryBuilder = query =>
  query
    .reduce((acc, next, i, arr) => {
      return (
        acc +
        (next.status === 'not' ? '-' : '') +
        `"${next.query}"` +
        (arr[i + 1] ? ' OR ' : '')
      );
    }, '')
    .trim();

export const dslBuilder = (query, fields) => {
  const q = queryBuilder(query);
  const splitFields = fields.reduce(
    (acc, next) => {
      acc[next.status] = acc[next.status].concat(next.title);
      return acc;
    },
    { included: [], excluded: [] }
  );

  let queryString = splitFields.included.length
    ? `${fieldBuilder(splitFields.included, q)}`
    : q;

  if (splitFields.excluded.length) {
    queryString = `${queryString}${fieldBuilder(
      splitFields.excluded,
      q,
      'exclude'
    )}`;
  }

  return queryString
    .trim()
    .replace(/^AND/, '')
    .trim();
};

export const queryMapper = queryObject =>
  fieldMaps.name.map((v, i) =>
    queryObject.map(q => ({
      ...q,
      fields: q.fields.map(f => ({ ...f, title: fieldMaps[f.title][i] })),
    }))
  );

export const mappedQueryBuilder = mappedQuery =>
  mappedQuery.reduce(
    (acc, next, i, arr) =>
      `${acc} ` +
      next.reduce(
        (acc, { fields, values }) =>
          `(${acc} ${dslBuilder(values, fields)})` + (arr[i + 1] ? ' OR' : ''),
        ''
      ),
    ''
  ) + '';
