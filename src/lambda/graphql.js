/* eslint-disable @typescript-eslint/no-var-requires */
const { ApolloServer, gql } = require('apollo-server-lambda');
const { RESTDataSource } = require('apollo-datasource-rest');
import { BASE_URL } from '../../src/config';
import { queryMapper, mappedQueryBuilder } from '../util/graphql-fields';
// queryObject -> queryMapper -> mappedQueryBuilder
const sources = [
  'textBody_descriptive_project',
  'textBody_descriptive_organisation',
  'textBody_abstract_project',
  'textBody_summary_organisation',
  'title_of_organisation',
  'terms_mesh_abstract',
  'placeName_country_organisation',
  'placeName_city_organisation',
  'id_iso2_country',
  'coordinate_of_organisation',
  'date_start_project',
  'cost_total_project',
  'currency_total_cost',
  'name_of_organisation',
  'terms_mesh_description',
  'placeName_country_organisation',
  'placeName_city_organisation',
  'id_iso2_country',
  'coordinate_of_city',
  'date_birth_organisation',
  'cost_of_funding',
  'currency_of_funding',
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

  async getNIH(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/nih_v2/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
        size,
      },
    });
  }

  async getCB(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/crunchbase/_search`, {
      query: {
        bool: {
          must: [{ query_string: { query: queryString } }, existsQuery],
        },
      },
      size,
    });
  }

  async getAll(queryObject) {
    const queryString = mappedQueryBuilder(queryMapper(queryObject));

    return this.post(`/health_scanner/_search`, {
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

// body and summary ahve been removed for now - performance reasons -- this had little effect

const typeDefs = gql`
  type Geopoint {
    lat: Float
    lon: Float
  }

  type Item {
    body: String
    city: String
    continent: String
    cost_ref: Float
    countries_codes: [String]
    countries_names: [String]
    country: String
    country_id: String
    end: String
    is_health_related: Boolean
    location: Geopoint
    name: String
    novelty: Float
    region: String
    state: String
    start: String
    summary: String
    sdg_labels: [String]
    terms: [String]
    type: String
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
    NIH(query: [QueryObject]): [Item]
    All(query: [QueryObject]): [Item]
  }
`;

const resolvers = {
  Query: {
    NIH: async (_source, { query }, { dataSources }) => {
      return dataSources.HealthScanner.getNIH(query);
    },
    CB: async (_source, { query }, { dataSources }) => {
      return dataSources.HealthScanner.getCB(query);
    },
    All: async (_source, { query }, { dataSources }) => {
      const data = await dataSources.HealthScanner.getAll(query);

      return data.hits.hits;
    },
  },
  Item: { ...itemResolvers, type: parent => parent._index },
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
