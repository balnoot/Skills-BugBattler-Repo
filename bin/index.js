#! /usr/bin/env node

const { getBanner } = require("./banner");

console.log(getBanner());

const fs = require("fs");
const path = require("path");

const REPORTS_FILE = __dirname + "/../reports.json";

const STATUSES = ["open", "in_progress", "closed"];
const PRIORITIES = ["low", "medium", "high"];



const HELP_TEXT = `

hier meot nog meer komen straks yeay

`;

function fail(message) {
    console.error(`Fout: ${message}`);
    process.exit(1);
}



