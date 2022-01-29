import { delay } from "./libs/delay/index";
import { jpyg } from "../../jpyg/dist";
import { DDMMYYYY } from "../../jpyg/dist/api/get_jpy_price/DDMMYYYY";
import { Convertor } from "./convertor";

export const binanceConvertor: Convertor = {
  handle: async (data: string[][]) => {
    const [header, ...rows] = data;
    header.splice(6, 0, "Change_JPY");

    const newRows: string[][] = [header];
    const errorRows: string[][] = [header];

    const works = rows.map(
      (row, idx) =>
        new Promise<void>(async (resolve, reject) => {
          await delay(idx);
          try {
            const newRow = [...row];

            // 2021-01-03 17:03:10 -> [2021, 1, 3]
            const date = row[1]
              .split(" ")[0]
              .split("-")
              .map((x) => Number(x));

            const symbol = row[4];
            const unitPriceJpy = await jpyg(
              symbol,
              new DDMMYYYY(date[0], date[1], date[2]),
              { debug: false }
            );

            const change = Number(row[5]);
            const changeJpy = unitPriceJpy.jpy * change;

            newRow.splice(6, 0, changeJpy.toString());
            newRows.push(newRow);

            console.info(JSON.stringify(newRow, null, 2));

            resolve();
          } catch (error) {
            errorRows.push(row);

            console.error(`[ERROR] ${JSON.stringify(row, null, 2)}`);

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
