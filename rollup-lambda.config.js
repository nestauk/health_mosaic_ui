import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';

import {
  makeRequiredFields,
  makeResolvers,
} from './src/util/graphql-fields.js';
import { requiredFields, responseSize } from './src/config';

export default {
  input: 'src/lambda/graphql.js',
  output: {
    file: 'dist/lambda/graphql.js',
    format: 'cjs',
  },
  external: id => id.includes('apollo'),
  plugins: [
    json(),
    replace({
      REPLACE_ES_EXISTS_QUERY: JSON.stringify(
        makeRequiredFields(requiredFields)
      ),
      REPLACE_ES_GQL_FIELDS: makeResolvers(),
      REPLACE_ES_QUERY_SIZE: responseSize,
    }),
  ],
};
