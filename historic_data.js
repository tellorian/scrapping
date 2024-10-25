import launchPuppeteer from './puppeteer.js';
import fs from 'fs';

const start = 2015;
const end = 2020;
const leagues = [
    // {
    //     region: "england",
    //     league: "premier-league"
    // },
    // {
    //     region: "europe",
    //     league: "champions-league"
    // },
    // {
    //     region: "europe",
    //     league: "europa-league"
    // },
    // {
    //     region: "france",
    //     league: "ligue-1"
    // },
    // {
    //     region: "italy",
    //     league: "serie-a"
    // },
    // {
    //     region: "germany",
    //     league: "bundesliga"
    // },
    // {
    //     region: "spain",
    //     league: "laliga"
    // },
    // {
    //     region: "netherlands",
    //     league: "eredivisie"
    // },
    // {
    //     region: "greece",
    //     league: "super-league"
    // },
    // {
    //     region: "belgium",
    //     league: "jupiler-pro-league"
    // },
    {
        region: "belgium",
        league: "jupiler-league"
    },
    // {
    //     region: "portugal",
    //     league: "liga-portugal"
    // },
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

const run = async () => {
    const browser = await launchPuppeteer()
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 5000 });
    for (let i = 0; i < leagues.length; i++) {
        const league = leagues[i].league;
        const region = leagues[i].region;
        for (let year = start; year <= end; year++) {
            console.log(`Scrapping ${region}-${league}-${year}-${year + 1} Results`);
            await page.goto(`https://www.oddsportal.com/football/${region}/${league}-${year}-${year + 1}/results`);
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
                        data.push(`${date}${ps[0].textContent},${ps[ps.length > 6 ? 2 : 1].textContent},${ps[ps.length > 6 ? 3 : 2].textContent},${(goals.length > 1 ? goals[0].textContent : "-1")},${(goals.length > 1 ? goals[1].textContent : "-1")},${ps[ps.length > 6 ? 5 : 3].textContent},${ps[ps.length > 6 ? 6 : 4].textContent},${ps[ps.length > 6 ? 7 : 5].textContent}`)
                    });
                    return data;
                });
                total = total.concat(data);
                let pages = await page.$$eval("a.pagination-link", (els) =>
                    els.map((el) => el.textContent)
                );
                if (pages.length && pages[pages.length - 1] == 'Next') {
                    await page.click("a.pagination-link:last-child");
                    await new Promise((r) => setTimeout(r, 500));
                    continue;
                };
                break
            }
            fs.writeFileSync(`data/${region}-${league}-${year}-${year + 1}.csv`, "Date,HomeTeam,AwayTeam,FTHG,FTAG,ODDS1,ODDSX,ODDS2\n" + total.join("\n"), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file', err);
                } else {
                    console.log('File written successfully');
                }
            });
        }
    }
    // // Write JSON string to a file
    console.log("Done!!!");
    return
}

run();
