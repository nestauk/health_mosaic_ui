import ApolloClient from 'apollo-boost';
import { endpointQueries } from './gqlQueries';

export async function query(query, endpoint, id) {
  const client = new ApolloClient({
    /* eslint-disable-next-line no-undef */
    uri: REPLACE_GRAPHQL_ENDPOINT,
  });

  const results = await client.query({
    query: endpointQueries[endpoint.toLowerCase()],
    variables: {
      query,
    },
  });

  return { results, id };
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
