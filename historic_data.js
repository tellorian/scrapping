import launchPuppeteer from './puppeteer.js';
import fs from 'fs';

const run = async () => {
    const year = 2023;
    const browser = await launchPuppeteer()
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 2500 });
    await page.goto(`https://www.oddsportal.com/football/england/premier-league-${year}-${year + 1}/results`);
    let total = [];
    while (1) {
        await page.waitForSelector("div.eventRow");
        const data = await page.$$eval("div.eventRow", (els) => {
            const data = [];
            let date = "";
            els.map((ele) => {
                if (ele.children.length > 1) {
                    date = ele.children[ele.children.length - 2].querySelector("div:nth-child(1)").querySelector("div:nth-child(1)").textContent;
                }
                const el = ele.children[ele.children.length - 1].children[0].children[0];
                let ps = el.parentElement.querySelectorAll("p");
                if ((ps.length == 8 && ps[1].innerText.trim() == "postp.") || ps.length > 8) return
                const sub_el = el.querySelector("div:nth-child(1)").querySelector("div:nth-child(2)").querySelector("div:nth-child(1)").querySelector("div:nth-child(1)");
                const goals = sub_el.children.length >= 2 ? sub_el.children[1].querySelector("div:nth-child(1)")
                    .querySelectorAll("div") : [];
                data.push(`${date} ${ps[0].textContent},${ps[ps.length > 6 ? 2 : 1].textContent},${ps[ps.length > 6 ? 3 : 2].textContent},${(goals.length > 1 ? goals[0].textContent : "-1")},${(goals.length > 1 ? goals[1].textContent : "-1")},${ps[ps.length > 6 ? 5 : 3].textContent},${ps[ps.length > 6 ? 6 : 4].textContent},${ps[ps.length > 6 ? 7 : 5].textContent}`)
            });
            return data;
        });
        total = total.concat(data);
        const active = 1;
        let pages = await page.$$eval("a.pagination-link", (els) =>
            els.map((el) => {
                if (el.className.includes("active"))
                    active = Number(el.textContent);
                return el.textContent
            })
        );
        console.log(active);
        if (pages.length && pages[pages.length - 1] == 'Next') {
            await page.goto(`https://www.oddsportal.com/football/england/premier-league-${year}-${year + 1}/results/#/page/${active + 1}/`)
            await new Promise((r) => setTimeout(r, 5000));
            continue;
        };
        break
    }
    fs.writeFileSync(`data.csv`, "Date,HomeTeam,AwayTeam,FTHG,FTAG,ODDS1,ODDSX,ODDS2\n" + total.join("\n"), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file', err);
        } else {
            console.log('File written successfully');
        }
    });
    // // Write JSON string to a file
    console.log("Done!!!");
    return
}

run();
