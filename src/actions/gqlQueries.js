import { gql } from 'apollo-boost';

export const QUERY_ALL = gql`
  query All($query: [QueryObject]) {
    All(query: $query) {
      city
      continent_id
      cost_ref
      countries_ids
      country_id
      end
      funders
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      state_id
      start
      terms
      type
    }
  }
`;

export const QUERY_CB = gql`
  query CB($query: [QueryObject]) {
    CB(query: $query) {
      city
      continent_id
      cost_ref
      countries_ids
      country_id
      end
      funders
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      state_id
      start
      terms
      type
    }
  }
`;

export const QUERY_MU = gql`
  query MU($query: [QueryObject]) {
    MU(query: $query) {
      city
      continent_id
      cost_ref
      countries_ids
      country_id
      end
      funders
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      state_id
      start
      terms
      type
    }
  }
`;

export const QUERY_NIH = gql`
  query NIH($query: [QueryObject]) {
    NIH(query: $query) {
      city
      continent_id
      cost_ref
      countries_ids
      country_id
      end
      funders
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      sdg_labels
      state_id
      start
      terms
      type
    }
  }
`;

export const endpointQueries = {
  papers: QUERY_NIH,
  companies: QUERY_CB,
  events: QUERY_MU,
  all: QUERY_ALL,
};
