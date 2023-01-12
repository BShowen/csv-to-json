const { createWriteStream, createReadStream } = require("node:fs");
const path = require("node:path");

const transform = require(path.resolve(__dirname, "../main"));
const writeStream = createWriteStream(path.resolve(__dirname, "./output.json"));
const readStream = createReadStream(path.resolve(__dirname, "./big.csv"), {
  encoding: "utf-8",
});

const toJson = transform({
  readStream: readStream,
  writeStream: writeStream,
});

readStream.pipe(toJson).pipe(writeStream);
