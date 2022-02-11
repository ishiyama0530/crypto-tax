import { jpyg } from "../../jpyg/dist";
import { DDMMYYYY } from "../../jpyg/dist/api/get_jpy_price/DDMMYYYY";
import { Convertor } from "./convertor";
import { delay } from "./libs/delay/index";

export const ftxTradesConvertor: Convertor = {
  handle: async (data: string[][]) => {
    const [header, ...rows] = data;
    header.push(""); // C10
    header.push("total_price_jpy"); // C11
    header.push("fee_jpy"); // C12

    const newRows: string[][] = [header];
    const errorRows: string[][] = [header];

    const works = rows.map(
      (row, idx) =>
        new Promise<void>(async (resolve, reject) => {
          await delay(idx);
          try {
            const newRow = [...row];

            // 2021-12-27T01:35:24.999892+00:00 -> [2021, 1, 3]
            const date = row[1]
              .split("T")[0]
              .split("-")
              .map((x) => Number(x));

            const usdPrice = await jpyg(
              "usdt",
              new DDMMYYYY(date[0], date[1], date[2]),
              { currency: "jpy", debug: false }
            );
            const buyOrSell: "buy" | "sell" = row[3] as any;
            const totalPriceUsd = Number(row[7]);
            const totalPriceJpy =
              buyOrSell === "buy"
                ? totalPriceUsd * usdPrice.jpy * -1
                : totalPriceUsd * usdPrice.jpy;

            newRow.push(""); // C10
            newRow.push(totalPriceJpy.toString()); // C11

            const feeSymbol = row[9];

            let feeUnitPrice = 0;
            if (
              feeSymbol.toLocaleLowerCase() === "usd" ||
              feeSymbol.toLocaleLowerCase() === "usdt"
            ) {
              feeUnitPrice = usdPrice.jpy;
            } else {
              feeUnitPrice = (
                await jpyg(feeSymbol, new DDMMYYYY(date[0], date[1], date[2]), {
                  currency: "jpy",
                  debug: false,
                })
              ).jpy;
            }

            const feeUsd = Number(row[8]);
            const feePrice = feeUnitPrice * feeUsd * -1;
            newRow.push(feePrice.toString()); // C12
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
