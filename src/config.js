import { name } from '../package.json';
import { kebabcaseToCamelcase } from './util/string';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export const project_title = kebabcaseToCamelcase(name);
export const BASE_URL =
  'https://search-health-scanner-5cs7g52446h7qscocqmiky5dn4.eu-west-2.es.amazonaws.com';

export const CB_type = 'company';
export const MU_type = 'meetup';
export const NIH_type = 'paper';
export const typeLabels = {
  [CB_type]: 'Companies',
  [MU_type]: 'Social',
  [NIH_type]: 'Research',
};

export const typeNames = {
  paper: 'The National Institute for Health',
  meetup: 'Meetup',
  company: 'Crunchbase',
};

export const NIH_index = 'nih_v5';
export const endpointNIH = `${BASE_URL}/${NIH_index}`;
export const endpointNIHCount = `${endpointNIH}/_count`;
export const endpointNIHSearch = `${endpointNIH}/_search`;

export const CB_index = 'companies_v4';
export const endpointCB = `${BASE_URL}/${CB_index}`;
export const endpointCBCount = `${endpointCB}/_count`;
export const endpointCBSearch = `${endpointCB}/_search`;

export const MU_index = 'meetup_v3';
export const endpointMU = `${BASE_URL}/${MU_index}`;
export const endpointMU_Count = `${endpointMU}/_count`;
export const endpointMU_Search = `${endpointMU}/_search`;

export const HS_index = 'health_scanner';
export const endpointScanner = `${BASE_URL}/${HS_index}`;
export const endpointScannerCount = `${endpointScanner}/_count`;
export const endpointScannerSearch = `${endpointScanner}/_search`;

export const searchRouteName = 'search';
// export const aliases = `${BASE_URL}/_aliases`;

export const responseSize = dev ? 200 : 1000;
export const graphqlEndpoint = dev
  ? '"http://localhost:9000/.netlify/functions/graphql"'
  : '"/.netlify/functions/graphql"';

export const fieldGroups = {
  // subject
  name: 'name',
  place: 'place',

  // content
  body: 'body',
  categories: 'sdg_labels',
  cost: 'cost_ref',
  location: 'location',
  summary: 'summary',
  terms: 'terms',
  //time: 'start', 'end',
  type: 'type',
};

export const subjectAliases = ['name', 'place'];
export const contentAliases = ['body', 'summary', 'terms'];
export const ESIndices = ['all', 'research', 'companies', 'social'];

export const requiredFields = {
  CB: [
    { field: 'name_of_organisation', type: 'text' },
    { field: 'textBody_descriptive_organisation', type: 'text' },
    { field: 'textBody_summary_organisation', type: 'text' },
    { field: 'terms_mesh_description', type: 'text' },
    { field: 'placeName_city_organisation', type: 'keyword' },
    { field: 'id_iso2_country', type: 'keyword' },
    { field: 'coordinate_of_city', type: 'geo_point' },
    { field: 'date_birth_organisation', type: 'date' },
    { field: 'cost_of_funding', type: 'integer' },
  ],
  MU: [
    { field: 'coordinate_of_group', type: 'geo_point' },
    { field: 'date_start_group', type: 'date' },
    { field: 'id_iso2_country', type: 'keyword' },
    { field: 'name_of_group', type: 'text' },
    { field: 'placeName_city_group', type: 'keyword' },
    { field: 'terms_mesh_group', type: 'text' },
    { field: 'textBody_descriptive_group', type: 'text' },
  ],
  NIH: [
    { field: 'title_of_organisation', type: 'text' },
    { field: 'textBody_abstract_project', type: 'text' },
    { field: 'terms_mesh_abstract', type: 'text' },
    { field: 'placeName_city_organisation', type: 'keyword' },
    { field: 'id_iso2_country', type: 'keyword' },
    { field: 'coordinate_of_organisation', type: 'geo_point' },
    { field: 'date_start_project', type: 'date' },
    { field: 'cost_total_project', type: 'integer' },
  ],
};

/* logging */

export const log = {
  transitions: 0,
};

/* mapbox */

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

/*
mediaqueries (the last one must be of type `lt`)
*/
export const widthBreakpoints = {
  // gt_1460: '(min-width: 1460px)',
  // gt_1200: '(min-width: 1200px)',
  // gt_1080: '(min-width: 1080px)',
  // gt_920: '(min-width: 920px)',
  // gt_910: '(min-width: 910px)',
  // gt_900: '(min-width: 900px)',
  // gt_870: '(min-width: 870px)',
  // gt_840: '(min-width: 840px)',
  // gt_832: '(min-width: 832px)',
  // gt_800: '(min-width: 800px)',
  // gt_768: '(min-width: 768px)',
  // gt_720: '(min-width: 720px)',
  gt_640: '(min-width: 640px)',
  // gt_600: '(min-width: 600px)',
  // gt_540: '(min-width: 540px)',
  // gt_480: '(min-width: 480px)',
  lt_640: '(max-width: 640px)',
  // lt_480: '(max-width: 480px)'
};
