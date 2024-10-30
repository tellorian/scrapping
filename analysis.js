import fs from 'fs'
import csv from "csv-parser"
import leagues from "./leagues.json" assert { type: 'json' }

const start = 2015;
const end = 2023;

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
    let allResults = { football: [], basketball: [] };
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
    // Object.keys(results).map((type) => {
    //     const res = results[type].sort((a, b) => new Date(a.Date) - new Date(b.Date));
    //     const json2csvParser = new Parser();
    //     let csvData = json2csvParser.parse(res);
    //     csvData = csvData.replace(/"/g, '');
    //     // Write merged data to output CSV file
    //     fs.writeFile(`${type}_combined_data.csv`, csvData, (error) => {
    //         if (error) {
    //             console.error('Error writing output file:', error);
    //         } else {
    //             console.log(`Data has been written to ${type}_combined_data.csv`);
    //         }
    //     });
    // })
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