import dayjs from "dayjs";
import { getJpyPrice, ReturnObject } from "./api/get_jpy_price";
import { DDMMYYYY } from "./api/get_jpy_price/DDMMYYYY";

export async function jpyg(
  symbol: string,
  date: DDMMYYYY
): Promise<ReturnObject> {
  return getJpyPrice(symbol, date);
}

export default jpyg;
