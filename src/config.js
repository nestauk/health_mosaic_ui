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
  NIH: {
    name: ['title_of_organisation'],
    location: [
      'placeName_country_organisation',
      'placeName_state_organisation',
      'placeName_city_organisation',
    ],
  },
  CB: {
    name: ['name_of_organisation'],
    location: ['placeName_country_organisation', 'placeName_city_organisation'],
  },
};

export const contentFields = {
  NIH: {
    title: ['title_of_project'],
    summary: ['textBody_abstract_project'],
    body: ['textBody_descriptive_project'],
    terms: ['terms_mesh_abstract'],
    category: ['terms_sdg_project'],
  },
  CB: {
    title: [],
    summary: ['textBody_summary_organisation'],
    body: ['textBody_descriptive_organisation'],
    terms: ['terms_mesh_description'],
    category: [],
  },
};

export const requiredFields = {
  NIH: [
    { field: 'title_of_organisation', type: 'text' },
    { field: 'textBody_abstract_project', type: 'text' },
    { field: 'terms_mesh_abstract', type: 'text' },
    { field: 'placeName_country_organisation', type: 'keyword' },
    { field: 'placeName_city_organisation', type: 'keyword' },
    { field: 'id_iso3_country', type: 'keyword' },
    { field: 'coordinate_of_organisation', type: 'geo_point' },
    { field: 'date_start_project', type: 'date' },
    { field: 'cost_total_project', type: 'integer' },
  ],
  CB: [
    { field: 'name_of_organisation', type: 'text' },
    { field: 'textBody_descriptive_organisation', type: 'text' },
    { field: 'textBody_summary_organisation', type: 'text' },
    { field: 'terms_mesh_description', type: 'text' },
    { field: 'placeName_country_organisation', type: 'keyword' },
    { field: 'placeName_city_organisation', type: 'keyword' },
    { field: 'id_iso3_country', type: 'keyword' },
    { field: 'coordinate_of_city', type: 'geo_point' },
    { field: 'date_birth_organisation', type: 'date' },
    { field: 'cost_of_funding', type: 'integer' },
  ],
};

// export const subjectFields = {
//   name: ['title_of_organisation'],
//   location: [
//     'placeName_country_organisation',
//     'placeName_state_organisation',
//     'placeName_city_organisation',
//   ],
// };

// export const contentFields = {
//   title: ['title_of_project'],
//   summary: ['textBody_abstract_project'],
//   body: ['textBody_descriptive_project'],
//   terms: ['terms_mesh_abstract', 'terms_descriptive_project'],
//   category: ['terms_sdg_project'],
// };

export const MAPBOXGL_STYLEURL =
  'mapbox://styles/nesta-uk/cjja7cb0s0bcw2rmvflhof4io';

export const MAPBOXGL_ACCESSTOKEN =
  'pk.eyJ1IjoibmVzdGEtdWsiLCJhIjoiY2ozbjUzY2drMDAwNzJxbnl6a21uM253cSJ9.3RTMySEVk0LC4gQvGoG-Zw';

export const testLayer = {
  id: 'population',
  type: 'circle',
  'source-layer': 'sf2010',
  paint: {
    'circle-radius': {
      base: 1.75,
      stops: [[12, 2], [22, 180]],
    },
    'circle-color': [
      'match',
      ['get', 'ethnicity'],
      'White',
      '#fbb03b',
      'Black',
      '#223b53',
      'Hispanic',
      '#e55e5e',
      'Asian',
      '#3bb2d0',
      /* other */ '#ccc',
    ],
  },
};
export const testSource = {
  type: 'vector',
  url: 'mapbox://examples.8fgz4egr',
};
