import { jpyg } from "../../jpyg/dist";
import { DDMMYYYY } from "../../jpyg/dist/api/get_jpy_price/DDMMYYYY";
import { Convertor } from "./convertor";
import { delay } from "./libs/delay/index";

export const ftxFundingPaymentConvertor: Convertor = {
  handle: async (data: string[][]) => {
    const [header, ...rows] = data;
    header.push(""); // C5
    header.push("payment(jpy)"); // C6

    const newRows: string[][] = [header];
    const errorRows: string[][] = [header];

    const works = rows.map(
      (row, idx) =>
        new Promise<void>(async (resolve, reject) => {
          await delay(idx);
          try {
            const newRow = [...row];

            // 2021-12-27T01:35:24.999892+00:00 -> [2021, 1, 3]
            const date = row[0]
              .split("T")[0]
              .split("-")
              .map((x) => Number(x));

            const unitPrice = await jpyg(
              "usdt",
              new DDMMYYYY(date[0], date[1], date[2]),
              { currency: "jpy", debug: false }
            );

            const usdPayment = Number(row[2]);
            const jpyPayment = usdPayment * unitPrice.jpy;

            header.push(""); // C5
            newRow.push(jpyPayment.toString()); // C6
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
