const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export const BASE_URL =
  'https://search-health-scanner-5cs7g52446h7qscocqmiky5dn4.eu-west-2.es.amazonaws.com';

export const endpointRWJF = `${BASE_URL}/rwjf`;
export const endpointRWJFCount = `${endpointRWJF}/_count`;
export const endpointRWJFSearch = `${endpointRWJF}/_search`;

export const endpointNIH = `${BASE_URL}/nih_v2`;
export const endpointNIHCount = `${endpointNIH}/_count`;
export const endpointNIHSearch = `${endpointNIH}/_search`;

export const endpointCB = `${BASE_URL}/crunchbase`;
export const endpointCBCount = `${endpointCB}/_count`;
export const endpointCBSearch = `${endpointCB}/_search`;

export const endpointScanner = `${BASE_URL}/health_scanner`;
export const endpointScannerCount = `${endpointScanner}/_count`;
export const endpointScannerSearch = `${endpointScanner}/_search`;

export const size = dev ? 200 : 1000;

export const subjectFields = {
  name: ['title_of_organisation'],
  location: [
    'placeName_country_organisation',
    'placeName_state_organisation',
    'placeName_city_organisation',
  ],
};

export const contentFields = {
  title: ['title_of_project'],
  summary: ['textBody_abstract_project'],
  body: ['textBody_descriptive_project'],
  terms: ['terms_mesh_abstract', 'terms_descriptive_project'],
  category: ['terms_sdg_project'],
};

// https://innovation-n-mapping.slack.com/archives/GG3J5NNJ0/p1552400223040100
// `rwjf` the country and city fields are keywords
// `nih_v2` they are text and keywords
// `crunchbase_orgs_v1` they are keywords
// the aliases are set up as follows:
// `crunchbase_orgs_v1` -> `crunchbase`
// `crunchbase_orgs_v1` + `rwjf` -> `health_scanner`
// I’ll also add an alias for `nih` when I tidy it up
// follow https://github.com/nestauk/nesta/commits/crunchbase_mesh/nesta/production/orms
