import ApolloClient from 'apollo-boost';
import { endpointQueries } from './gqlQueries';

const cache = {
  all: new Map(),
  papers: new Map(),
  events: new Map(),
  companies: new Map(),
};
// endpoint = 'all' to prevent undefined endpoint
export async function query(query, endpoint = 'all', id) {
  const queryString = JSON.stringify(query, null, 0);
  const cachedQuery = cache[endpoint].get(queryString);

  if (cachedQuery) {
    return { results: cachedQuery, id };
  }

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

  cache[endpoint].set(queryString, results);

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
