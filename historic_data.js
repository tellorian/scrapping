import launchPuppeteer from './puppeteer.js';
import fs from 'fs';
const start = 2018;
const end = 2024;
const leagues = [
    // {
    //     "type": "football",
    //     "region": "europe",
    //     "league": "champions-league"
    // },
    // {
    //     "type": "football",
    //     "region": "europe",
    //     "league": "europa-league"
    // },
    // {
    //     "type": "football",
    //     "region": "england",
    //     "league": "premier-league"
    // },
    // {
    //     "type": "football",
    //     "region": "france",
    //     "league": "ligue-1"
    // },
    // {
    //     "type": "football",
    //     "region": "italy",
    //     "league": "serie-a"
    // },
    // {
    //     "type": "football",
    //     "region": "germany",
    //     "league": "bundesliga"
    // },
    // {
    //     "type": "football",
    //     "region": "spain",
    //     "league": "laliga"
    // },
    // {
    //     "type": "football",
    //     "region": "netherlands",
    //     "league": "eredivisie"
    // },
    // {
    //     "type": "football",
    //     "region": "greece",
    //     "league": "super-league"
    // },
    // {
    //     "type": "football",
    //     "region": "turkey",
    //     "league": "super-lig"
    // },
    // {
    //     "type": "football",
    //     "region": "scotland",
    //     "league": "premiership"
    // },
    // {
    //     "type": "football",
    //     "region": "belgium",
    //     "league": "jupiler-pro-league"
    // },
    // {
    //     "type": "football",
    //     "region": "belgium",
    //     "league": "jupiler-league"
    // },
    // {
    //     "type": "football",
    //     "region": "portugal",
    //     "league": "liga-portugal"
    // },
    // {
    //     "type": "football",
    //     "region": "portugal",
    //     "league": "primeira-liga"
    // },
    // {
    //     "type": "basketball",
    //     "region": "europe",
    //     "league": "euroleague"
    // },
    // {
    //     "type": "basketball",
    //     "region": "usa",
    //     "league": "nba"
    // },
    // {
    //     "type": "basketball",
    //     "region": "europe",
    //     "league": "champions-league"
    // },
    // {
    //     "type": "basketball",
    //     "region": "europe",
    //     "league": "fiba-europe-cup"
    // },
    // {
    //     "type": "basketball",
    //     "region": "australia",
    //     "league": "nbl"
    // },
    // {
    //     "type": "basketball",
    //     "region": "argentina",
    //     "league": "liga-a"
    // },
    // {
    //     "type": "basketball",
    //     "region": "france",
    //     "league": "pro-b"
    // },
    // {
    //     "type": "basketball",
    //     "region": "brazil",
    //     "league": "nbb"
    // },
    // {
    //     "type": "american-football",
    //     "region": "usa",
    //     "league": "nfl"
    // },
    // {
    //     "type": "american-football",
    //     "region": "usa",
    //     "league": "ncaa"
    // },
    // {
    //     "type": "baseball",
    //     "region": "japan",
    //     "league": "npb",
    //     "season_type": 1
    // },
    // {
    //     "type": "baseball",
    //     "region": "mexico",
    //     "league": "lmp"
    // },
    {
        "type": "baseball",
        "region": "usa",
        "league": "mlb",
        "season_type": 1
    },
    // {
    //     "type": "baseball",
    //     "region": "venezuela",
    //     "league": "lvbp"
    // },
    // {
    //     "type": "baseball",
    //     "region": "dominican-republic",
    //     "league": "lidom"
    // }
];


const run = async () => {
    const browser = await launchPuppeteer()
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 5000 });
    const failed = [];
    for (let i = 0; i < leagues.length; i++) {
        const { league, region, type, season_type } = leagues[i];
        for (let year = start; year <= end; year++) {
            console.log(`Scrapping ${type}/${region}-${league}-${year}-${year + 1} Results`);
            try {
                if (year == 2024) await page.goto(`https://www.oddsportal.com/${type}/${region}/${league}/results`);
                else if (season_type) await page.goto(`https://www.oddsportal.com/${type}/${region}/${league}-${year}/results`);
                else await page.goto(`https://www.oddsportal.com/${type}/${region}/${league}-${year}-${year + 1}/results`);
                let total = [];
                while (1) {
                    await page.waitForSelector("div.eventRow");
                    const data = await page.$$eval("div.eventRow", (els) => {
                        const data = [];
                        let date = "";
                        els.map((ele) => {
                            if (ele.children.length > 1) {
                                date = ele.children[ele.children.length - 2].querySelector("div:nth-child(1)").querySelector("div:nth-child(1)").textContent;
                                if (date.includes("Today")) date = new Date().toISOString();
                                else if (date.includes("Yesterday")) {
                                    const yesterday = new Date();
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    date = yesterday.toISOString();
                                }
                                else date = new Date(date.slice(0, 11)).toISOString();
                            }
                            const el = ele.children[ele.children.length - 1].children[0].children[0];
                            let ps = el.parentElement.querySelectorAll("p");
                            if (ps[1].textContent == "postp." || ps[1].textContent == "canc." || ps[1].textContent == "award." || ps[1].textContent == "w.o." || ps.length > 8) return
                            const sub_el = el.querySelector("div:nth-child(1)").querySelector("div:nth-child(2)").querySelector("div:nth-child(1)").querySelector("div:nth-child(1)");
                            const goals = sub_el.children.length >= 2 ? sub_el.children[1].querySelector("div:nth-child(1)").querySelectorAll("div") : [];
                            let HomeTeam = ps[ps.length > 6 ? 2 : 1].textContent;
                            let AwayTeam = ps[ps.length > 6 ? 3 : 2].textContent;
                            HomeTeam = HomeTeam.includes("(") ? HomeTeam.slice(0, -7) : HomeTeam;
                            AwayTeam = AwayTeam.includes("(") ? AwayTeam.slice(0, -7) : AwayTeam;
                            // if (type == "football") 
                            // data.push(`${date.slice(0, 10)} ${ps[0].textContent},${HomeTeam},${AwayTeam},${(goals.length > 1 ? goals[0].textContent : "-1")},${(goals.length > 1 ? goals[1].textContent : "-1")},${ps[ps.length > 6 ? 5 : 3].textContent},${ps[ps.length > 6 ? 6 : 4].textContent},${ps[ps.length > 6 ? 7 : 5].textContent}`)
                            // else
                            data.push(`${date.slice(0, 10)} ${ps[0].textContent},${HomeTeam},${AwayTeam},${(goals.length > 1 ? goals[0].textContent : "-1")},${(goals.length > 1 ? goals[1].textContent : "-1")},${ps[ps.length > 6 ? 5 : 3].textContent},${ps[ps.length > 6 ? 6 : 4].textContent}`)

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
                fs.writeFileSync(`data/${type}/${region}-${league}-${year}-${year + 1}.csv`, `Date,HomeTeam,AwayTeam,FTHG,FTAG,ODDS1${type == "football" ? ",ODDSX" : ""},ODDS2\n` + total.join("\n"), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file', err);
                    } else {
                        console.log('File written successfully');
                    }
                });

            } catch (err) {
                console.log(err);
                console.warn(`🧨🧨Error on scrapping ${type}/${region}-${league}-${year}-${year + 1} results`);
                failed.push(`${type}/${region}-${league}-${year}-${year + 1}`);
            }
        }
    }
    // // Write JSON string to a file
    console.log("Done!!!");
    console.log(failed);
    return
}

run();
