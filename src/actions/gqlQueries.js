import { gql } from 'apollo-boost';

export const QUERY_ALL = gql`
  query All($query: [QueryObject], $logic: String) {
    All(query: $query, logic: $logic) {
      body
      city
      continent
      continent_id
      cost
      cost_ref
      countries_ids
      country
      country_id
      currency
      end
      funders
      is_duplicate
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      start
      state
      state_id
      summary
      terms
      title
      type
      url
    }
  }
`;

export const QUERY_CB = gql`
  query CB($query: [QueryObject], $logic: String) {
    CB(query: $query, logic: $logic) {
      body
      city
      continent
      continent_id
      cost
      cost_ref
      countries_ids
      country
      country_id
      currency
      end
      funders
      is_duplicate
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      start
      state
      state_id
      summary
      terms
      title
      type
      url
    }
  }
`;

export const QUERY_MU = gql`
  query MU($query: [QueryObject], $logic: String) {
    MU(query: $query, logic: $logic) {
      body
      city
      continent
      continent_id
      cost
      cost_ref
      countries_ids
      country
      country_id
      currency
      end
      funders
      is_duplicate
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      start
      state
      state_id
      summary
      terms
      title
      type
      url
    }
  }
`;

export const QUERY_NIH = gql`
  query NIH($query: [QueryObject], $logic: String) {
    NIH(query: $query, logic: $logic) {
      body
      city
      continent
      continent_id
      cost
      cost_ref
      countries_ids
      country
      country_id
      currency
      end
      funders
      is_duplicate
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      start
      state
      state_id
      summary
      terms
      title
      type
      url
    }
  }
`;

export const QUERY_AGGREGATIONS = gql`
  query Aggregation($query: [AggregationInput]) {
    Aggregation(query: $query) {
      name
      buckets {
        key
        string_key
        count
      }
    }
  }
`;

export const endpointQueries = {
  research: QUERY_NIH,
  companies: QUERY_CB,
  social: QUERY_MU,
  all: QUERY_ALL,
  aggregation: QUERY_AGGREGATIONS,
};
