import { gql } from 'apollo-boost';

export const QUERY_ALL = gql`
  query All($query: [QueryObject]) {
    All(query: $query) {
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
  query CB($query: [QueryObject]) {
    CB(query: $query) {
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
  query MU($query: [QueryObject]) {
    MU(query: $query) {
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
  query NIH($query: [QueryObject]) {
    NIH(query: $query) {
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

export const endpointQueries = {
  research: QUERY_NIH,
  companies: QUERY_CB,
  social: QUERY_MU,
  all: QUERY_ALL,
};
