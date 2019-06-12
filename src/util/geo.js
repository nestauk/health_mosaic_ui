import * as _ from 'lamb';

export const createColoredFeatures = (colorMap, key) => _.pipe([
  _.getKey('features'),
  _.mapWith(
    _.updateKey('properties', properties => ({
      ...properties,
      color: _.has(colorMap, properties[key])
        ? colorMap[properties[key]]
        : null
    }))
  )
]);
