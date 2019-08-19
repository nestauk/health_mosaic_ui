import { gql } from 'apollo-boost';

export const QUERY_ALL = gql`
  query All($query: [QueryObject], $logic: String) {
    All(query: $query, logic: $logic) {
      body
      city
      continent
      continent_id
      cost_ref
      countries_ids
      country
      country_id
      end
      funders
      funding {
        cost_ref
        end_date
        start_date
        year
      }
      id
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      score
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
      cost_ref
      countries_ids
      country
      country_id
      end
      funders
      funding {
        cost_ref
        end_date
        start_date
        year
      }
      id
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      score
      sdg_labels
      start
      state
      state_id
      summary
      terms
      title
      type
      url
      url_source
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
      cost_ref
      countries_ids
      country
      country_id
      end
      funders
      funding {
        cost_ref
        end_date
        start_date
        year
      }
      id
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      score
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
      cost_ref
      countries_ids
      country
      country_id
      end
      funders
      funding {
        cost_ref
        end_date
        start_date
        year
      }
      id
      is_health_related
      location {
        lon
        lat
      }
      name
      novelty
      region
      score
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
