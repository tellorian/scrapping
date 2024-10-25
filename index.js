import launchPuppeteer from './puppeteer.js';
import fs from 'fs';

const run = async () => {
    const date = `${2024}${10}${22}`;
    const browser = await launchPuppeteer()
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 20500 });
    await page.goto(`https://www.oddsportal.com/matches/football/${date}/`);
    await page.waitForSelector("div.group.flex");
    const data = await page.$$eval("div.group.flex > a", (els) => {
        const data = [];
        els.map((el) => {
            let ps = el.parentElement.querySelectorAll("p");
            if ((ps.length == 8 && ps[1].innerText.trim() == "postp.") || ps.length > 8) return
            const sub_el = el.querySelector("div:nth-child(1)").querySelector("div:nth-child(2)").querySelector("div:nth-child(1)").querySelector("div:nth-child(1)");
            const goals = sub_el.children.length >= 2 ? sub_el.children[1].querySelector("div:nth-child(1)")
                .querySelectorAll("div") : [];
            data.push(ps[0].innerText.trim() + "," + ps[ps.length > 6 ? 2 : 1].innerText.trim() + "," + ps[ps.length > 6 ? 3 : 2].innerText.trim() +
                "," + (goals.length > 1 ? goals[0].innerText.trim() : "-1") + "," + (goals.length > 1 ? goals[1].innerText.trim() : "-1") +
                "," + ps[ps.length > 6 ? 5 : 3].innerText.trim() + "," + ps[ps.length > 6 ? 6 : 4].innerText.trim() + "," + ps[ps.length > 6 ? 7 : 5].innerText.trim())

        });
        return data;
    });
    // // Write JSON string to a file
    fs.writeFileSync(`${date}.csv`, "Time,HomeTeam,AwayTeam,FTHG,FTAG,ODDS1,ODDSX,ODDS2\n" + data.join("\n"), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file', err);
        } else {
            console.log('File written successfully');
        }
    });
    console.log("Done!!!");
    return
}

run();
