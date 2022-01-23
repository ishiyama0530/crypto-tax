import { jpyg } from "../../jpyg/dist";
import { DDMMYYYY } from "../../jpyg/dist/api/get_jpy_price/DDMMYYYY";
import * as csv from "csv";
import fs from "fs";

export default function main() {
  const parser = csv.parse({ trim: true }, async (e, data: string[][]) => {
    const [header, ...rows] = data;
    header.splice(6, 0, "Change_JPY");

    const newRows: string[][] = [header];

    const works = rows.map(
      (row) =>
        new Promise<void>(async (resolve, reject) => {
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

            resolve();
          } catch (error) {
            reject(error);
          }
        })
    );

    await Promise.all(works);
    const writeStream = fs.createWriteStream("out.csv");

    const destroy = () => {
      console.log("destroy called");
      writeStream.close();
      stringifier.end();
    };

    const stringifier = csv.stringify(newRows);

    stringifier
      .on("data", (chunk) => {
        writeStream.write(chunk);
      })
      .on("error", (err) => destroy());

    writeStream.on("error", (err) => destroy());
  });

  fs.createReadStream("data.csv").pipe(parser);
}

main();
