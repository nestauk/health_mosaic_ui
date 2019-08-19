import * as _ from 'lamb';
import { fieldGroups } from '../config';

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
  ],
  continent: [
    'placeName_continent_organisation',
    'placeName_continent_group',
  ],
  continent_id: [
    'id_continent_organisation',
    'id_continent_group',
    'id_of_continent',
  ],
  cost_ref: [
    'cost_of_funding',
    'cost_total_project'
  ],
  countries_ids: ['terms_of_countryTags'],
  country: [
    'placeName_country_organisation',
    'placeName_country_group',
  ],
  country_id: ['id_iso2_country'],
  end: [
    'date_death_organisation',
    'date_end_project',
  ],
  funders: ['terms_of_funders'],
  funding: ['json_funding_project'],
  id: ['id_of_project'],
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
    'rank_rhodonite_abstract'
  ],
  region: ['placeName_region_organisation'],
  sdg_labels: [
    '_terms_sdg_summary',
    '_terms_sdg_description',
    'terms_sdg_abstract',
  ],

  start: [
    'date_birth_organisation',
    'date_start_group',
    'date_start_project',
  ],
  state: [
    'placeName_state_organisation',
    '_placeName_state_group',
  ],
  state_id: ['id_state_organisation'],
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
  url_source: ['url_crunchBase_organisation'],
  type: ['type_of_entity']
};

const makeFieldExist = field => ({ exists: { field } });
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

  resolvers += `
  es_id: (parent) => parent._id,
  score: (parent) => parent._score,`;

  for (const field in fieldMaps) {
    resolvers += `
  ${field}: (parent) => {
    ${fieldMapEntry(fieldMaps[field])}
  },`;
  }

  return `${resolvers} \n}`;
};

const queryBuilder = query =>
  (query.status === 'not' ? '-' : '') + `"${query.query}"`;

/*
TODO use upcoming svizzle's `isPathValue` or `isKeyValue`
_.some(isKeyValue('status', 'included''))
*/
const hasIncluded = arr =>
  _.filter(arr, ({ status }) => status === 'included').length > 0;

const createNormalFieldQuery = query => ({ title, status }) =>
  `${status === 'excluded' ? 'NOT ' : ''}${title}:(${query})`;

const isNotPlace = ({ title }) => title !== 'place';
const isPlace = ({ title }) => title === 'place';

const places = ['continent', 'country', 'state', 'city'];

const createPlaceFieldQuery = query => {
  const placeQuery = places
    .map(v => `${v}:(${query})`)
    .join(query.trim().startsWith('-') ? ' AND ' : ' OR ');
  return `(${placeQuery})`;
};

const makeFieldQuery = query =>
  _.pipe([
    _.filterWith(v => v.status !== 'default'),
    _.filterWith(isNotPlace),
    _.mapWith(createNormalFieldQuery(query)),
  ]);

const createSingleQuery = ({ values, fields }) => {
  const query = _.map(values, queryBuilder);
  const joinedQueries = query.join(' AND ');

  const places = fields.find(isPlace)
    ? _.map(query, createPlaceFieldQuery).join(' AND ')
    : '';

  const fieldQuery = makeFieldQuery(query)(fields).join(' AND ');

  let queryString =
    hasIncluded(fields) && fieldQuery
      ? fieldQuery
      : joinedQueries + (fieldQuery.length ? ` AND ${fieldQuery}` : '');

  queryString = places ? `( ${queryString} ) AND ( ${places} )` : queryString;
  return `( ${queryString} )`;
};

export const mappedQueryBuilder = (queryObject, logic) =>
  queryObject.map(createSingleQuery).join(` ${logic} `);

export const mapFieldAlias = ({ title, status }) => ({
  title: fieldGroups[title],
  status,
});
