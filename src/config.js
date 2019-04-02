const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export const baseUrl =
  'https://search-health-scanner-5cs7g52446h7qscocqmiky5dn4.eu-west-2.es.amazonaws.com/rwjf/_search';
export const size = dev ? 250 : 1000;

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
