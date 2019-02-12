const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export const baseUrl = dev
  ? 'http://3.8.107.150:9200/rwjf_test/_search'
  : 'https://18.130.95.111:9200/rwjf_test/_search';
export const size = dev ? 200 : 1000;
