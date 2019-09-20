import ApolloClient from 'apollo-boost';
import { endpointQueries } from './gqlQueries';

const cache = {
  OR: {
    all: new Map(),
    research: new Map(),
    social: new Map(),
    companies: new Map(),
  },
  AND: {
    all: new Map(),
    research: new Map(),
    social: new Map(),
    companies: new Map(),
  },
};
// endpoint = 'all' to prevent undefined endpoint
export async function query(
  query,
  endpoint = 'all',
  logic = 'AND',
  id
) {
  const queryString = JSON.stringify(query, null, 0);
  const cachedQuery = cache[logic][endpoint].get(queryString);

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
      logic,
    },
  });

  cache[logic][endpoint].set(queryString, results);

  return { results, id };
}

// TODO: Errors are weird with gql, needs more research

// class SearchError extends Error {
//   constructor(type, reason) {
//     super(`${type}: ${reason}`);
//     this.name = 'SearchError';
//     this.type = type;
//     this.reason = reason;
//   }
// }
