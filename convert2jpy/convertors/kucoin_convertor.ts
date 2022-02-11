import { jpyg } from "../../jpyg/dist";
import { DDMMYYYY } from "../../jpyg/dist/api/get_jpy_price/DDMMYYYY";
import { Convertor } from "./convertor";
import { delay } from "./libs/delay/index";

export const kucoinConvertor: Convertor = {
  handle: async (data: string[][]) => {
    const [header, ...rows] = data;
    header.push(""); // C11
    header.push("total_price_jpy"); // C12
    header.push("fee_jpy"); // C13

    const newRows: string[][] = [header];
    const errorRows: string[][] = [header];

    const works = rows.map(
      (row, idx) =>
        new Promise<void>(async (resolve, reject) => {
          await delay(idx);
          try {
            const newRow = [...row];

            // 2021-03-25 10:09:24 -> [2021, 1, 3]
            const date = row[0]
              .split(" ")[0]
              .split("-")
              .map((x) => Number(x));

            const usdPrice = await jpyg(
              "usdt",
              new DDMMYYYY(date[0], date[1], date[2]),
              { currency: "jpy", debug: false }
            );
            const buyOrSell: "buy" | "sell" = row[3] as any;
            const totalPriceUsd = Number(row[6]);
            const totalPriceJpy =
              buyOrSell === "buy"
                ? totalPriceUsd * usdPrice.jpy * -1
                : totalPriceUsd * usdPrice.jpy;

            newRow.push(""); // C11
            newRow.push(totalPriceJpy.toString()); // C12

            const feeUsd = Number(row[7]);
            const feePrice = usdPrice.jpy * feeUsd * -1;
            newRow.push(feePrice.toString()); // C13
            newRows.push(newRow);

            console.info(JSON.stringify(newRow, null, 2));

            resolve();
          } catch (error) {
            errorRows.push(row);

            console.error(`[ERROR] ${JSON.stringify(row, null, 2)}`);
            console.error(error);

            resolve();
          }
        })
    );

    await Promise.all(works);

    return {
      errorRows,
      newRows,
    };
  },
};
