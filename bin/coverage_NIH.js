#! /usr/bin/env node -r esm

import * as _ from 'lamb';
import fetch from 'node-fetch';
import {tapValue} from '@svizzle/utils';

import {endpointNIHCount} from '../src/config';

/* utils */

const allValues = _.pipe([_.values, _.flatten]);

const pickAndTransformValues = fnMap => _.pipe([
  _.pickIf((value, key) => _.has(fnMap, key)),
  _.mapValuesWith((value, key) => _.application(fnMap[key], [value]))
]);

/*
{string: [a, b], date: [c, d]}  // a, b, c, d: functions
=>
transformValues({
  string: _.mapWith(_.collect([a, b])),
  date: _.mapWith(_.collect([c, d]))
})
*/
const makeApplyRules = _.pipe([
  _.mapValuesWith(_.pipe([_.collect, _.mapWith])),
  pickAndTransformValues,
]);

/*
// fieldTypes
{
  string: [
    "foo",
    "bar",
  ],
  date: [
    "zoo",
    "jar",
  ]
}

// rules (a, b, c, are functions)
{string: [a, b], date: [c, d]}
=>
[
  a("foo"), b("foo"),
  a("bar"), b("bar"),
  c("zoo"), d("zoo"),
  c("jar"), d("jar"),
]
*/
const applyTypeRules = (fieldTypes, rules) =>
  allValues(
    makeApplyRules(rules)(fieldTypes)
  );

const mapToAllValues = fn => _.pipe([_.values, _.flatten, _.mapWith(fn)]);

// Elastic Search queries
const makeFieldExists = field => ({exists: {field}}); // exists
const makeStringFieldIsNotEmpty = field => ({term: {[field]: ""}}); // bool

const makeAllFieldExists = mapToAllValues(makeFieldExists);

/* coverage */

const fieldTypes = {
  string: [
    "id_of_project",
    "title_of_organisation",
    "title_of_project",
    "textBody_descriptive_project",
    "textBody_abstract_project",
    "terms_descriptive_project",
    "terms_mesh_abstract",
    "placeName_country_organisation",
    "placeName_state_organisation",
    "placeName_city_organisation",
    "placeName_zipcode_organisation",
    "id_iso2_country",
    "id_iso3_country",
    "id_of_continent",
    "currency_total_cost",
    // "terms_sdg_project",
  ],
  date: [
    "date_start_project",
    "date_end_project",
  ],
  number: [
    "id_isoNumeric_country",
    "year_fiscal_funding",
    "cost_total_project",
    // "score_crossPollination_project",
    // "score_growth_project"
  ],
  coords: [
    "coordinate_of_organisation",
  ]
};

const makeBody = fieldTypes => ({
  query: {
    bool: {
      must: makeAllFieldExists(fieldTypes),
      must_not: [
        applyTypeRules(fieldTypes, {
          string: [makeStringFieldIsNotEmpty]
        })
        // ...strings.map(makeStringFieldIsNotEmpty)
      ]
    }
  }
});

// console.log(JSON.stringify(makeBody(fieldTypes), null, 2))

/*
{
  foo: [
    "a",
    "b",
  ],
  bar: [
    "c",
    "d",
  ]
}
=>
[
  {foo: "a"},
  {foo: "b"},
  {bar: "c"},
  {bar: "d"}
]
*/
const makeKeyedPairs = _.pipe([
  _.pairs,
  _.mapWith(([key, array]) =>
    _.map(array, item => ({[key]: item}))
  ),
  _.flatten,
]);

/*
[
  {foo: "a"},
  {foo: "b"},
  {bar: "c"},
  {bar: "d"}
]
=>
[
  [{foo: "a"}, {foo: "b"}],
  [{foo: "a"}, {bar: "c"}],
  [{foo: "a"}, {bar: "d"}],
  [{foo: "b"}, {bar: "c"}],
  [{foo: "b"}, {bar: "d"}],
  [{bar: "c"}, {bar: "d"}]
]
*/
const makeBiPermutations = _.reduceWith((acc, item, index, array) => {
  for (let cursor = index + 1; cursor < array.length; cursor++) {
    acc.push([item, array[cursor]]);
  }
  return acc;
}, []);

/*
[{foo: "b"}, {bar: "c"}, {bar: "d"}]
=>
{
  foo: ['b'],
  bar: ['c', 'd'],
}
*/
const makeFieldTypes = _.pipe([
  _.mapWith(_.pairs),
  _.shallowFlatten,
  _.groupBy(_.getAt(0)),
  _.mapValuesWith(_.mapWith(_.getAt(1))),
  // tapValue,
]);
// makeFieldTypes([{foo: "b"}, {bar: "c"}, {bar: "d"}]);

const makeQueriesPermutations = _.pipe([
  // tapValue,
  makeKeyedPairs,
  makeBiPermutations,
  _.groupBy(_.pipe([_.getAt(0), _.pairs, _.getPath("0.1")])),
  _.mapValuesWith(
    _.mapWith(_.pipe([
      makeFieldTypes,
      makeBody
    ]))
  )
]);

const fetchPermutations = obj => {
  const data = {}
  const todo = {}

  const promisesObj = _.mapValues(obj, (bodies, key) => {
    data[key] = new Array(bodies.length);

    return _.map(bodies, (body, index) =>
      fetch(endpointNIHCount, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(json => {
        data[key][index] = json.count
        console.log(key, index, data[key])
      })
      .catch(err => {
        console.log("!!!", key, index, err.message)
        if (!_.has(todo, key)) {
          todo[key] = [index]
        } else {
          todo[key].push(index)
        }
      })
    )
  });
  const promises = _.flatten(_.values(promisesObj))

  Promise.all(promises)
  .then(json => {
    console.log("data", JSON.stringify(data, null, 2))
  })
  .catch(err => {
    console.log("data", JSON.stringify(data, null, 2))
    console.log("todo", JSON.stringify(todo, null, 2))
  })
}

const queryPermutations = makeQueriesPermutations(fieldTypes);
console.log(JSON.stringify(queryPermutations, null, 2));

fetchPermutations(queryPermutations)


// test: makeApplyRules
// const _rules = {string: [x => 1, x => 2], date: [x => 3, x => 4]}
// console.log(makeApplyRules(_rules))

// test: applyTypeRules
// console.log(
//   applyTypeRules(fieldTypes, {
//     string: [makeStringFieldIsNotEmpty]
//   })
// )

/*
RWJF
data {
  "id_of_project": [
    1574246,
    1574246,
    1574246,
    1873113,
    1574246,
    1873113,
    1541377,
    1496483,
    1510794,
    1505972,
    1540447,
    1540447,
    1540447,
    2371476,
    1380667,
    1383617,
    1540447,
    2371476,
    2371476,
    1509945
  ],
  "title_of_organisation": [
    1574390,
    1574390,
    1346105,
    1574390,
    1346105,
    1541380,
    1496486,
    1510797,
    1505975,
    1540450,
    1540450,
    1540450,
    1574390,
    1380702,
    1383650,
    1540450,
    1574390,
    1574390,
    1509948
  ],
  "title_of_project": [
    1574390,
    1346105,
    1574390,
    1346105,
    1541380,
    1496486,
    1510797,
    1505975,
    1540450,
    1540450,
    1540450,
    1574390,
    1380702,
    1383650,
    1540450,
    1574390,
    1574390,
    1509948
  ],
  "textBody_descriptive_project": [
    1346105,
    1574390,
    1346105,
    1541380,
    1496486,
    1510797,
    1505975,
    1540450,
    1540450,
    1540450,
    1574390,
    1380702,
    1383650,
    1540450,
    1574390,
    1574390,
    1509948
  ],
  "textBody_abstract_project": [
    1346105,
    1873239,
    1314843,
    1279314,
    1287832,
    1286278,
    1314725,
    1314725,
    1314725,
    1873239,
    1172240,
    1179037,
    1314725,
    1873239,
    1873239,
    1287689
  ],
  "terms_descriptive_project": [
    1346105,
    1541380,
    1496486,
    1510797,
    1505975,
    1540450,
    1540450,
    1540450,
    1574390,
    1380702,
    1383650,
    1540450,
    1574390,
    1574390,
    1509948
  ],
  "terms_mesh_abstract": [
    1314843,
    1279314,
    1287832,
    1286278,
    1314725,
    1314725,
    1314725,
    1873239,
    1172240,
    1179037,
    1314725,
    1873239,
    1873239,
    1287689
  ],
  "placeName_country_organisation": [
    1496485,
    1510797,
    1505974,
    1540450,
    1540450,
    1540450,
    1541380,
    1379886,
    1382852,
    1540450,
    1541380,
    1541380,
    1509948
  ],
  "placeName_state_organisation": [
    1496480,
    1495915,
    1496485,
    1496485,
    1496485,
    1496486,
    1362911,
    1366062,
    1496485,
    1496486,
    1496486,
    1496402
  ],
  "placeName_city_organisation": [
    1505971,
    1509887,
    1509887,
    1509887,
    1510797,
    1376710,
    1379677,
    1509887,
    1510797,
    1510797,
    1509948
  ],
  "placeName_zipcode_organisation": [
    1505627,
    1505627,
    1505627,
    1505975,
    1372226,
    1375315,
    1505627,
    1505975,
    1505975,
    1505564
  ],
  "id_iso2_country": [
    1540450,
    1540450,
    1540450,
    1378956,
    1381924,
    1540450,
    1540450,
    1540450,
    1509754
  ],
  "id_iso3_country": [
    1540450,
    1540450,
    1378956,
    1381924,
    1540450,
    1540450,
    1540450,
    1509754
  ],
  "id_of_continent": [
    1540450,
    1378956,
    1381924,
    1540450,
    1540450,
    1540450,
    1509754
  ],
  "currency_total_cost": [
    1380702,
    1383650,
    1540450,
    2371620,
    2371620,
    1509948
  ],
  "date_start_project": [
    null,
    null,
    null,
    null,
    null
  ],
  "date_end_project": [
    null,
    null,
    null,
    null
  ],
  "id_isoNumeric_country": [
    null,
    null,
    null
  ],
  "year_fiscal_funding": [
    null,
    null
  ],
  "cost_total_project": [
    null
  ]
}
*/


/*
nih_v2
1574246
1574246
1574246
1873113
1574246
1873113
1574246
1496483
1574246
1505972
1540447
1540447
1540447
2371476
1380667
1383617
1540447
2371476
2371476
1509945
1574390
1574390
1346105
1574390
1346105
1574390
1496486
1574390
1505975
1540450
1540450
1540450
1574390
1380702
1383650
1540450
1574390
1574390
1509948
1574390
1346105
1574390
1346105
1574390
1496486
1574390
1505975
1540450
1540450
1540450
1574390
1380702
1383650
1540450
1574390
1574390
1509948
1346105
1574390
1346105
1574390
1496486
1574390
1505975
1540450
1540450
1540450
1574390
1380702
1383650
1540450
1574390
1574390
1509948
1346105
1873239
1346105
1279314
1346105
1286278
1314725
1314725
1314725
1873239
1172240
1179037
1314725
1873239
1873239
1287689
1346105
1574390
1496486
1574390
1505975
1540450
1540450
1540450
1574390
1380702
1383650
1540450
1574390
1574390
1509948
1346105
1279314
1346105
1286278
1314725
1314725
1314725
1873239
1172240
1179037
1314725
1873239
1873239
1287689
1496486
1574390
1505975
1540450
1540450
1540450
1574390
1380702
1383650
1540450
1574390
1574390
1509948
1496486
1495915
1496485
1496485
1496485
1496486
1362911
1366062
1496485
1496486
1496486
1496402
1505975
1540450
1540450
1540450
1574390
1380702
1383650
1540450
1574390
1574390
1509948
1505627
1505627
1505627
1505975
1372226
1375315
1505627
1505975
1505975
1505564
1540450
1540450
1540450
1378956
1381924
1540450
1540450
1540450
1509754
1540450
1540450
1378956
1381924
1540450
1540450
1540450
1509754
1540450
1378956
1381924
1540450
1540450
1540450
1509754
1380702
1383650
1540450
2371620
2371620
1509948
*/
