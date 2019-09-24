import * as _ from 'lamb';
import {
  applyFnMap,
  hasIterableLength1,
  isIterableNotEmpty,
} from '@svizzle/utils';

import { makeBiPermutationsWith, sortValueDescKeyAsc } from './array';
import { isNilWith } from './function.any.boolean';
import { getId } from './object.string';

export const makeEmptyNetwork = () => ({ nodes: {}, links: {} });

export const getLinkId = (a, b) => `${a} <-> ${b}`;
export const makeGetLinkLabel = nodeKeyToLabel =>
  (a, b) => getLinkId(nodeKeyToLabel(a), nodeKeyToLabel(b));

export const getVolume = _.getPath('items.length');

export const getLinksNodeIds = _.pipe([
  _.flatMapWith(_.getKey('nodes')),
  _.uniques,
]);

export const makeUndirectedNetworkWith = (accessor, nodeKeyToLabel = _.identity) => {
  const makePropBiPermutations = makeBiPermutationsWith(accessor);
  const isPropNull = isNilWith(accessor);
  const getLinkLabel = makeGetLinkLabel(nodeKeyToLabel);

  return items => _.reduce(items, (acc, item, index) => {
    if (isPropNull(item)) {
      return acc;
    }

    const array = accessor(item);

    // expecting an iterable
    // FIXME, make it more generic?
    if (hasIterableLength1(array)) {
      const key = array[0];
      if (!_.has(acc.nodes, key)) {
        acc.nodes[key] = {
          id: key,
          label: nodeKeyToLabel(key),
          to: [],
          items: [item.id]
        };
      } else {
        !acc.nodes[key].items.includes(item.id)
          && acc.nodes[key].items.push(item.id);
      }

      return acc;
    }

    makePropBiPermutations(item)
    .forEach(([a, b]) => {
      // nodes
      if (!_.has(acc.nodes, a)) {
        acc.nodes[a] = {
          id: a,
          label: nodeKeyToLabel(a),
          to: [b],
          items: [item.id]
        };
      } else {
        !acc.nodes[a].to.includes(b)
          && acc.nodes[a].to.push(b);
        !acc.nodes[a].items.includes(item.id)
          && acc.nodes[a].items.push(item.id);
      }

      if (!_.has(acc.nodes, b)) {
        acc.nodes[b] = {
          id: b,
          label: nodeKeyToLabel(b),
          to: [a],
          items: [item.id]
        };
      } else {
        !acc.nodes[b].to.includes(a)
          && acc.nodes[b].to.push(a);
        !acc.nodes[b].items.includes(item.id)
          && acc.nodes[b].items.push(item.id);
      }

      // links
      const linkId = getLinkId(a, b);
      if (!_.has(acc.links, linkId)) {
        acc.links[linkId] = {
          id: linkId,
          label: getLinkLabel(a, b),
          nodes: [a, b],
          items: [item.id]
        };
      } else {
        !acc.links[linkId].items.includes(item.id)
          && acc.links[linkId].items.push(item.id);
      }
    });

    return acc;
  }, makeEmptyNetwork());
}

export const makeFilterUndirectedNetwork = (
  maxLinksAmount = 100,
  maxNodesAmount = 100,
) => network => {
  const getTopNodes = _.pipe([
    _.getKey('nodes'),
    _.values,
    _.sortWith([_.sorterDesc(getVolume)]),
    _.take(maxNodesAmount),
    _.indexBy(_.getKey('id'))
  ]);

  const getTopLinks = _.pipe([
    _.getKey('links'),
    _.values,
    _.sortWith([_.sorterDesc(getVolume)]),
    _.take(maxLinksAmount)
  ]);

  const topNodes = getTopNodes(network);
  const topLinks = getTopLinks(network);
  const topLinksNodeIds = getLinksNodeIds(topLinks);
  const topLinksNodes = _.pick(network.nodes, topLinksNodeIds);

  return {
    links: topLinks,
    nodes: _.merge(topNodes, topLinksNodes)
  };
}

export const makeUndirectedNetworkBy = key =>
  makeUndirectedNetworkWith(_.getKey(key));

/*
fnMap {
  key: keyAccessor,
  value: valueAccessor
}
*/
export const getNetworkProps = (key, fnMap) =>
  _.pipe([
    _.getKey(key),
    _.values,
    _.mapWith(applyFnMap(fnMap)),
    sortValueDescKeyAsc
  ]);
export const getNodeDegree = _.getPath('to.length');
export const isDisconnectedNode = _.pipe([
  _.getKey('to'),
  isIterableNotEmpty
]);

export const kvMapIdVolume = {
  key: getId,
  value: getVolume
};
export const kvMapIdDegree = {
  key: getId,
  value: getNodeDegree
};
export const makeKeyValueFromIdVolume = applyFnMap(kvMapIdVolume);

export const makeNodesDegrees = getNetworkProps('nodes', kvMapIdDegree);
export const makeNodesVolume = getNetworkProps('nodes', kvMapIdVolume);
export const makeLinksVolume = getNetworkProps('links', kvMapIdVolume);

export const getNodesSortedWith = accessor => _.pipe([
  _.getKey('nodes'),
  _.values,
  _.sortWith([_.sorterDesc(accessor)])
]);

export const getNodesSortedDescByVolume = getNodesSortedWith(getVolume);
export const removeDisconnectedNodes = _.filterWith(isDisconnectedNode);
