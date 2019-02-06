const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export const baseUrl = 'http://3.8.107.150:9200/rwjf_test/_search';
export const size = dev ? 200 : 1000;
