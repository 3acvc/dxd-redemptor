#!/usr/bin/env node

import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const importMetaUrlPath = fileURLToPath(import.meta.url);
const __dirname = dirname(importMetaUrlPath);
const require = createRequire(importMetaUrlPath);

// build contracts
process.chdir(`${__dirname}/../../`);
execSync("forge build");
process.chdir(__dirname);
console.log("Contracts built");

// move updated abis to abis folder
const { abi: redemptorAbi } = require("./out/Redemptor.sol/Redemptor.json");
const outPath = join(__dirname, "abis");
if (!existsSync(outPath)) mkdirSync(outPath);
writeFileSync(
  join(outPath, "redemptor.json"),
  JSON.stringify(redemptorAbi, undefined, 4)
);
console.log("Files prepared");
