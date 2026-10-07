#! /usr/bin/env node

// haalt de banner op uit bin/banner.js
const { getBanner } = require("./banner");

// en print deze hier: dit gebeurt bij het opstarten van de CLI met nu het command mango
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



