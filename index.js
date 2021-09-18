import express from "express";
import axios from "axios";
import cheerio from "cheerio";

async function getPriceFeed() {
  try {
    const url = "https://coinmarketcap.com";

    const { data } = await axios({
      method: "GET",
      url,
    });

    const $ = cheerio.load(data);
    console.log($);

    const selector =
      "#__next > div.bywovg-1.sXmSU > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr";

    const keys = [
      "rank",
      "name",
      "price",
      "24h",
      "7d",
      "marketCap",
      "volume",
      "circulatingSupply",
    ];

    const coinArr = [];

    $(selector).each((parentId, parentEl) => {
      let keyIdx = 0;
      const coinObj = {};

      if (parentId <= 9) {
        //primeros 10 elementos

        $(parentEl)
          .children()
          .each((childId, childEl) => {
            let tdValue = $(childEl).text();

            if (keyIdx === 1 || keyIdx === 6) {
              tdValue = $("p:first-child", $(childEl).html()).text();
            }

            if (tdValue) {
              coinObj[keys[keyIdx]] = tdValue;
              keyIdx++;
            }
          });
        coinArr.push(coinObj);
      }
    });

    return coinArr;
  } catch (error) {
    console.log(error);
  }
}

const app = express();

app.get("/api/price-feed", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed();

    return res.status(200).json({
      data: priceFeed,
    });
  } catch (error) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.listen(3000, () => {
  console.log("Server on port: ", 3000);
});
