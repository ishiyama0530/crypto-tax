import * as csv from "csv";
import dayjs from "dayjs";
import fs from "fs";
import { Convertor } from "../convertors/convertor";
import { kucoinConvertor } from "../convertors/kucoin_convertor";

const convertor: Convertor = kucoinConvertor;

export default function main() {
  const parser = csv.parse({ trim: true }, async (e, data: string[][]) => {
    const { newRows, errorRows } = await convertor.handle(data);

    const ws = fs.createWriteStream(
      `.workspace/kucoin/out_${dayjs().format("YYYY-MM-DD-HH:mm:ssZ[Z]")}.csv`
    );

    csv
      .stringify(newRows)
      .on("data", (chunk) => ws.write(chunk))
      .on("error", (err) => destroy(ws));

    ws.on("error", (err) => destroy(ws));

    const errorWs = fs.createWriteStream(
      `.workspace/kucoin/error_${dayjs().format("YYYY-MM-DDTHH:mm:ssZ[Z]")}.csv`
    );

    csv
      .stringify(errorRows)
      .on("data", (chunk) => errorWs.write(chunk))
      .on("error", (err) => destroy(errorWs));

    errorWs.on("error", (err) => destroy(errorWs));
  });

  fs.createReadStream(".workspace/kucoin/data.csv").pipe(parser);
}

const destroy = (ws: fs.WriteStream) => {
  console.log("destroy called");
  ws.close();
  ws.end();
};

main();
