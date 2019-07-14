import * as _ from 'lamb';

import {countries} from '../../data/geo/iso_a2_to_name_by_type.json';

export const countryLabel = geoId => countries[geoId];

export const createColoredFeatures = (colorMap, key) =>
  _.pipe([
    _.getKey('features'),
    _.mapWith(
      _.updateKey('properties', properties => ({
        ...properties,
        color: _.has(colorMap, properties[key])
          ? colorMap[properties[key]]
          : null,
      }))
    ),
  ]);

export const getBounds = latLonArray => {
  let n = 0,
    s = 0,
    e = 0,
    w = 0;

  for (let i = 0; i < latLonArray.length; i += 1) {
    const [lat, lon] = latLonArray[i];
    if (i === 0) {
      n = lat;
      s = lat;
      w = lon;
      e = lon;
    }

    if (lat >= n) n = lat;
    if (lat <= s) s = lat;
    if (lon <= w) w = lon;
    if (lon >= e) e = lon;
  }

  return [[s, w], [n, e]];
};

const createGeoJsonFeature = ({ location: coord, name }) => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [coord.lon, coord.lat],
  },
  properties: {
    name,
  },
});

export const makeGeoJson = results => ({
  type: 'FeatureCollection',
  features: results.map(createGeoJsonFeature),
});
