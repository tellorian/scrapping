import fs from 'fs'
import csv from "csv-parser"
import { Parser } from 'json2csv';
import leagues from "./leagues.json" assert { type: 'json' }
const start = 2015;
const end = 2024;

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

async function readMultipleCSVFiles() {
    let allResults = { football: [], basketball: [], "american-football": [], baseball: [] };
    for (let i = 0; i < leagues.length; i++) {
        const { league, region, type } = leagues[i];
        for (let year = start; year <= end; year++) {
            const path = `data/${type}/${region}-${league}-${year}-${year + 1}.csv`
            if (fs.existsSync(path))
                allResults[type] = allResults[type].concat(await readCSVFile(path))
        }
    }
    return allResults;
}

readMultipleCSVFiles().then((results) => {
    Object.keys(results).map((type) => {
        const res = results[type].sort((a, b) => new Date(a.Date) - new Date(b.Date));
        const json2csvParser = new Parser();
        let csvData = json2csvParser.parse(res);
        csvData = csvData.replace(/"/g, '');
        fs.writeFile(`data/${type}.csv`, csvData, (error) => {
            if (error) {
                console.error('Error writing output file:', error);
            } else {
                console.log(`Data has been written to data/${type}.csv`);
            }
        });
    })

}).catch((error) => console.error("Error processing files:", error));