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
  date: DDMMYYYY
): Promise<ReturnObject> {
  const coinInfo = list.find((x) => x.symbol === symbol.toLowerCase());
  if (coinInfo === undefined) {
    throw new Error(`tickerSymbol ${symbol} is not found.`);
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
