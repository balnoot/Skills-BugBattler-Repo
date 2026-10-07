#!/usr/bin/env node

const fs = require("fs");
const { parseArgs } = require("util");
const { getBanner } = require("./banner");

const REPORTS_FILE = __dirname + "/../reports.json";

const STATUSES = ["open", "in_progress", "closed"];
const PRIORITIES = ["low", "medium", "high"];



const HELP_TEXT = `
${getBanner()}
BugBattler - beheer je bug reports.

Gebruik:
  bugbattler <command> [opties]

Commands:
  add-report      Voeg een bug report toe
  list-reports    Bekijk bug reports
  filter          Filter bug reports
  help            Toon deze helptekst, dit is dus niet nuttig meer

Voorbeelden:
  bugbattler add-report --title "Login werkt niet" --description "Login geeft een error" --priority high --status open
  bugbattler list-reports --status open
  bugbattler filter --status open --priority high
`;


function fail(message) {
    console.error(`Fout: ${message}`);
    process.exit(1);
}

function validateReport(report) {
    if (!STATUSES.includes(report.status)) {
        fail(`Ongeldige status, kies uit: ${STATUSES.join(",")}`);
    }

    if (!PRIORITIES.includes(report.priority)) {
        fail(`Ongeldige priority, kies uit: ${PRIORITIES.join(",")}`);
    }
}

function loadReports() {
    if(!fs.existsSync(REPORTS_FILE)) {
        return [];
    }

    return JSON.parse(
        fs.readFileSync(REPORTS_FILE, "utf-8")
    );
}

function saveReports(reports) {
    fs.writeFileSync(
        REPORTS_FILE,
        JSON.stringify(reports, null, 2)
    );
}

const [command, ...args] = process.argv.slice(2);

const { values } = parseArgs({
    args,
    options: {
        title: {
            type: "string"
        },
        description: {
            type: "string"
        },
        priority: {
            type: "string"
        },
        status: {
            type: "string"
        }
    }

});


switch (command) {
    case "add": {
        const report = {
            title: values.title,
            description: values.description,
            priority: values.priority,
            status: values.status
        };

        validateReport(report);

        const reports = loadReports();
        reports.push(report);
        saveReports(reports);

        console.log("Report toegevoegd!");
        break;
    }

    case "list": {
        const reports = loadReports();
        console.log(reports);
        break;  
    }

    case "filter": {
    const reports = loadReports();
    let filtered = reports;

    if (values.status) {
        filtered = filtered.filter(r => r.status === values.status);
    }

    if (values.priority) {
        filtered = filtered.filter(r => r.priority === values.priority);
    }

    console.log(filtered);
    break;
    }


    case "help":
    default:
        console.log(HELP_TEXT);
        break;
}
