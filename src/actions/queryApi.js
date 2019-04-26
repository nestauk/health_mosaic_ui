import ApolloClient, { gql } from 'apollo-boost';

export async function query(query) {
  const QUERY_ALL = gql`
    query All($query: [QueryObject]) {
      All(query: $query) {
        city
        continent
        cost_ref
        countries_codes
        countries_names
        country
        country_id
        end
        is_health_related
        location {
          lon
          lat
        }
        name
        novelty
        region
        sdg_labels
        state
        start
        terms
        type
      }
    }
  `;
  const client = new ApolloClient({
    /* eslint-disable-next-line no-undef */
    uri: REPLACE_GRAPHQL_ENDPOINT,
  });
  const results = await client.query({
    query: QUERY_ALL,
    variables: {
      query,
    },
  });

  return results;
}

// TODO: Error are weird with gql, needs more research

// class SearchError extends Error {
//   constructor(type, reason) {
//     super(`${type}: ${reason}`);
//     this.name = 'SearchError';
//     this.type = type;
//     this.reason = reason;
//   }
// }
