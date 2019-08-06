export const aggregations = [
  {
    name: 'amount_city',
    path: 'city',
    type: 'terms',
    field: 'city.keyword',
    size: 500,
  },
  {
    name: 'amount_state_id',
    field: 'state_id',
    type: 'terms',
    size: 500,
  },
  {
    name: 'amount_continent_id',
    field: 'continent_id',
    type: 'terms',
    size: 500,
  },
  {
    name: 'amount_country_id',
    field: 'amount_country_id',
    type: 'terms',
  },
  {
    name: 'amount_year_interval',
    type: 'date_histogram',
    field: 'start',
    interval: 'year',
  },
  {
    name: 'amount_mounth_interval',
    type: 'date_histogram',
    field: 'start',
    interval: 'month',
  },
];
