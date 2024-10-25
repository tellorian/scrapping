import fs from 'fs'
import csv from "csv-parser"

const start = 2015;
const end = 2023;
const leagues = [
    {
        region: "england",
        league: "premier-league"
    },
    {
        region: "europe",
        league: "champions-league"
    },
    {
        region: "europe",
        league: "europa-league"
    },
    {
        region: "france",
        league: "ligue-1"
    },
    {
        region: "italy",
        league: "serie-a"
    },
    {
        region: "germany",
        league: "bundesliga"
    },
    {
        region: "spain",
        league: "laliga"
    },
    {
        region: "netherlands",
        league: "eredivisie"
    },
    {
        region: "greece",
        league: "super-league"
    },
    {
        region: "belgium",
        league: "jupiler-pro-league"
    },
    {
        region: "belgium",
        league: "jupiler-league"
    },
    {
        region: "portugal",
        league: "liga-portugal"
    },
    {
        region: "portugal",
        league: "primeira-liga"
    },
    {
        region: "turkey",
        league: "super-lig"
    },
    {
        region: "scotland",
        league: "premiership"
    }
];

async function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

async function readMultipleCSVFiles(filePaths) {
    let allResults = [];
    for (let i = 0; i < leagues.length; i++) {
        const league = leagues[i].league;
        const region = leagues[i].region;
        for (let year = start; year <= end; year++) {
            const path = `data/${region}-${league}-${year}-${year + 1}.csv`
            if (fs.existsSync(path))
                allResults = allResults.concat(await readCSVFile(path))
        }
    }
    return allResults;
}

readMultipleCSVFiles().then((results) => {
    let match_cnt = 0;
    for (let i = 0; i < results.length; i++) {
        results[i]["res"] = results[i]['FTHG'] > results[i]['FTAG'] ? 'H' : results[i]['FTHG'] < results[i]['FTAG'] ? 'A' : 'D';
        results[i]["pred"] = (results[i]['ODDS1'] < results[i]['ODDS2'] && results[i]['ODDS1'] < results[i]['ODDSX']) ? 'H' : (results[i]['ODDS2'] < results[i]['ODDS1'] && results[i]['ODDS2'] < results[i]['ODDSX']) ? 'A' : 'D';
        if (results[i].res == results[i].pred)
            match_cnt++;
    }
    // console.table(results);
    console.log(match_cnt, results.length, match_cnt / results.length);
}).catch((error) => console.error("Error processing files:", error));