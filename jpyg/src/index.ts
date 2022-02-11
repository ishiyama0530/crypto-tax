import dayjs from "dayjs";
import { getJpyPrice, ReturnObject } from "./api/get_jpy_price";
import { DDMMYYYY } from "./api/get_jpy_price/DDMMYYYY";

export async function jpyg(
  symbol: string,
  date: DDMMYYYY,
  option: { currency: string; debug: boolean } = {
    currency: "jpy",
    debug: false,
  }
): Promise<ReturnObject> {
  return getJpyPrice(symbol, date, option);
}

export default jpyg;

const symbol = process.argv[2];
const date = process.argv[3];
const currency = process.argv[4] ?? "jpy";
const debug = process.argv[5] === "debug";

async function entryPointForConsole() {
  const dateSplitted = date.split("-");
  const ddmmyyyy = new DDMMYYYY(
    Number(dateSplitted[0]),
    Number(dateSplitted[1]),
    Number(dateSplitted[2])
  );
  const jpy = await jpyg(symbol, ddmmyyyy, { currency, debug });
  console.log(jpy);
}

if (symbol && date) {
  entryPointForConsole();
}
