#!/usr/bin/env node -r esm

import fs from "fs";
import path from "path";

import { readJson, readTsv, saveObj } from "@svizzle/file";
import * as _ from "lamb";

const ISOTYPE = "iso_a2";
const WORLD_JSON_110 = path.resolve(__dirname, "..", "node_modules/world-atlas/world/110m.json");
const WORLD_TSV_110 = path.resolve(__dirname, "..", "node_modules/world-atlas/world/110m.tsv");
const WORLD_JSON_110_ISOTYPE = path.resolve(__dirname, "..", `data/geo/world_110m_${ISOTYPE}.json`);

const makeIdIsoA2Map = _.pipe([
  _.indexBy(_.getKey("iso_n3")),
  _.mapValuesWith(_.getKey(ISOTYPE)),
]);

Promise.all([
  readJson(WORLD_JSON_110),
  readTsv(WORLD_TSV_110, _.identity).then(makeIdIsoA2Map),
])
.then(([topojson, map]) =>
  _.updatePathIn(topojson, "objects.countries.geometries",
    _.mapWith(obj => ({
      ...obj,
      properties: {
        [ISOTYPE]: map[obj.id],
      }
    }))
  )
)
.then(saveObj(WORLD_JSON_110_ISOTYPE))
.then(() => {
  console.log(`Saved topojson with ${ISOTYPE} property in ${WORLD_JSON_110_ISOTYPE}\n`)
})
.catch(err => console.error(err));
