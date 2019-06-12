/* eslint-disable @typescript-eslint/no-var-requires */
const { ApolloServer, gql } = require('apollo-server-lambda');
const { RESTDataSource } = require('apollo-datasource-rest');

import {
  BASE_URL,
  NIH_index,
  CB_index,
  MU_index,
  HS_index,
} from '../../src/config';
import { queryMapper, mappedQueryBuilder } from '../util/graphql-fields';

// queryObject -> queryMapper -> mappedQueryBuilder
const sources = [
  //  body
  'textBody_descriptive_project',
  'textBody_descriptive_organisation',
  'textBody_abstract_project',

  //  city
  'placeName_city_group',
  'placeName_city_organisation',

  //  continent_id
  'id_continent_organisation',
  'id_continent_group',
  'id_of_continent',

  //  cost
  'cost_of_funding',
  'cost_total_project',

  //  cost_ref
  'cost_of_funding',
  'cost_total_project',

  //  countries_ids
  'terms_of_countryTags',

  //  country_id
  'id_iso2_group',
  'id_iso2_country',

  // currency
  'currency_of_funding',
  'currency_total_cost',

  //  end
  'date_death_organisation',
  'date_end_project',

  //  funders
  'terms_of_funders',

  //  is_duplicate
  'booleanFlag_duplicate_abstract',

  //  is_health_related
  'booleanFlag_health_organisation',

  //  location
  'coordinate_of_city',
  'coordinate_of_group',
  'coordinate_of_organisation',

  //  name
  'name_of_organisation',
  'name_of_group',
  'title_of_organisation',

  //  novelty
  'cost_of_funding',
  'count_member_group',
  'cost_total_project',

  //  region
  'placeName_region_organisation',

  //  sdg_labels
  '_terms_sdg_summary',
  '_terms_sdg_description',
  '_terms_sdg_abstract',

  //  start
  'date_birth_organisation',
  'datetime_start_group',
  'date_start_project',

  //  state_id
  'id_state_organisation',

  //  summary
  'textBody_summary_organisation',
  'textBody_abstract_project',

  //  terms
  'terms_mesh_description',
  'terms_mesh_abstract',

  //  title
  'title_of_project',

  //  url
  'url_of_organisation',
  'url_of_group',
];

// eslint-disable-next-line no-undef
const existsQuery = REPLACE_ES_EXISTS_QUERY;
// eslint-disable-next-line no-undef
const itemResolvers = REPLACE_ES_GQL_FIELDS;
// eslint-disable-next-line no-undef
const size = REPLACE_ES_QUERY_SIZE;

class HealthScanner extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = BASE_URL;
  }

  async getCB(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/${CB_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
    });
  }

  async getMU(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/${MU_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
    });
  }

  async getNIH(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/${NIH_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
        size,
      },
    });
  }

  async getAll(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/${HS_index}/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
      _source: sources,
    });
  }
}

const typeDefs = gql`
  type Geopoint {
    lat: Float
    lon: Float
  }

  type Item {
    body: String
    city: String
    continent: String
    continent_id: String
    cost: Float
    cost_ref: Float
    countries_ids: [String]
    country: String
    country_id: String
    currency: String
    end: String
    funders: [String]
    is_duplicate: Boolean
    is_health_related: Boolean
    location: Geopoint
    name: String
    novelty: Float
    region: String
    sdg_labels: [String]
    start: String
    state: String
    state_id: String
    summary: String
    terms: [String]
    title: String
    type: String
    url: String
  }

  input ESQuery {
    title: String
    status: String
  }

  input ESValue {
    query: String
    status: String
  }

  input QueryObject {
    fields: [ESQuery]
    values: [ESValue]
  }

  type Query {
    CB(query: [QueryObject]): [Item]
    MU(query: [QueryObject]): [Item]
    NIH(query: [QueryObject]): [Item]
    All(query: [QueryObject]): [Item]
  }
`;

const resolvers = {
  Query: {
    CB: async (_source, { query }, { dataSources }) => {
      return dataSources.HealthScanner.getCB(query);
    },
    MU: async (_source, { query }, { dataSources }) => {
      return dataSources.HealthScanner.getMU(query);
    },
    NIH: async (_source, { query }, { dataSources }) => {
      return dataSources.HealthScanner.getNIH(query);
    },
    All: async (_source, { query }, { dataSources }) => {
      const data = await dataSources.HealthScanner.getAll(query);

      return data.hits.hits;
    },
  },
  Item: itemResolvers,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      HealthScanner: new HealthScanner(),
    };
  },
});

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type,Origin,Accept'],
  },
});
