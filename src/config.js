const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export const baseUrl =
  'https://search-health-scanner-5cs7g52446h7qscocqmiky5dn4.eu-west-2.es.amazonaws.com/rwjf/_search';
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
