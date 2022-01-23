import CoinGecko from "coingecko-api";
import list from "../../data/coingeko_coinlist_20220123.json";
import { DDMMYYYY } from "./DDMMYYYY";
export type CoinList = typeof list;

export type ReturnObject = {
  name: string;
  symbol: string;
  date: Date;
  jpy: number;
};

export async function getJpyPrice(
  symbol: string,
  date: DDMMYYYY,
  option: { debug: boolean } = { debug: false }
): Promise<ReturnObject> {
  if (option.debug) {
    console.debug(
      `type=debug, symbol=${symbol}, date=${date}, option=${JSON.stringify(
        option,
        null,
        2
      )}`
    );
  }

  const coinInfo = list.find((x) => x.symbol === symbol.toLowerCase());
  if (coinInfo === undefined) {
    throw new Error(`tickerSymbol ${symbol} is not found.`);
  }

  if (option.debug) {
    console.debug(`type=debug, coinInfo=${JSON.stringify(coinInfo, null, 2)}`);
  }

  const client = new CoinGecko();
  let resp = await client.coins.fetchHistory(coinInfo.id, {
    date: date.toString(),
    localization: false,
  });

  if (!resp.success) {
    throw new Error(`code=${resp.code}, message=${resp.message}`);
  }

  return {
    name: coinInfo.name,
    symbol: coinInfo.symbol,
    date: date.toDate(),
    jpy: resp.data.market_data.current_price.jpy,
  };
}
