const { createWriteStream, createReadStream } = require("node:fs");

const transform = require("../main");
const writeStream = createWriteStream("./output.json");
const readStream = createReadStream("./big.csv", {
  encoding: "utf-8",
});

const toJson = transform({
  readStream: readStream,
  writeStream: writeStream,
});

readStream.pipe(toJson).pipe(writeStream);
