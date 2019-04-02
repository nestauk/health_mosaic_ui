import {
  getKey,
  getPath,
  groupBy,
  mapValuesWith,
  pipe,
  skipKeys,
  sorterDesc,
  sortWith,
} from 'lamb';
import { objectToKeyValueArray } from '@svizzle/utils';

const countBy = key =>
  pipe([
    groupBy(getPath(`_source.${key}`)),
    skipKeys(['', 'null', 'undefined']),
    mapValuesWith(getKey('length')),
    objectToKeyValueArray,
    sortWith([sorterDesc(getKey('value'))]),
  ]);

/* NIH */

export const countByCountry = countBy('placeName_country_organisation');
export const countByCity = countBy('placeName_city_organisation');

// TODO use @svizzle/geo

// filter duplicate institutions and those without coords
const filterDuplicateInstitutions = results => {
  const uniqueInstitutions = new Set();
  const filteredInstitutions = [];

  results.forEach(({ _source }) => {
    if (
      !uniqueInstitutions.has(_source.title_of_organisation) &&
      (_source.coordinate_of_organisation && _source.title_of_organisation)
    ) {
      uniqueInstitutions.add(_source.title_of_organisation);
      filteredInstitutions.push(_source);
    }
  });

  return filteredInstitutions;
};

const createGeoJsonFeature = ({
  coordinate_of_organisation: coord,
  title_of_organisation: title,
}) => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [parseFloat(coord.lon), parseFloat(coord.lat)],
  },
  properties: {
    title,
  },
});

export const makeGeoJson = results => ({
  type: 'FeatureCollection',
  features: filterDuplicateInstitutions(results).map(createGeoJsonFeature),
});
