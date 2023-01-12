const { createWriteStream, createReadStream, write } = require("node:fs");
const { Transform } = require("node:stream");
const writeStream = createWriteStream("./consoles.json");
const readStream = createReadStream("./people.csv", {
  encoding: "utf-8",
});

const convertToJson = (() => {
  let isFirstRead = true;
  let isFirstWrite = true;
  let isListeningForEndOfReadStream = false;
  let headers;

  const convert = new Transform({
    transform(data, encoding, callback) {
      // Listen for the emitter to emit "end". This is when the last json
      // bracket (]) is written to the file, thus completing the JSON file.
      if (!isListeningForEndOfReadStream) {
        isListeningForEndOfReadStream = true;
        readStream.on("end", () => {
          writeStream.write("]");
        });
      }

      // Convert the chunk from Buffer to string so it can be operated on.
      let chunk = data.toString();

      // If the is the first chunk of data (i.e. the first read) then the first
      // row of values is the header of the CSV.
      if (isFirstRead) {
        const buffer = chunk.split("\r\n");
        headers = buffer.shift().split(",");
        headers = headers.map((header) => header.trim());
        chunk = buffer.join("\r\n");
        isFirstRead = !isFirstRead;
        writeStream.write("[");
      }

      // If this is NOT the first time we are writing to the output file, then
      // there needs to be a comma inserted after the previously written line.
      if (!isFirstWrite) {
        writeStream.write(",");
      }

      // Remove empty lines from chunk. This can happen when the last line in
      // the file is empty
      chunk = chunk
        .split("\r\n")
        .filter((dataString) => {
          // Filter to remove any empty strings.
          return dataString.length;
        })
        .join("\r\n");

      // transform the chunk into json.
      const preJsonChunk = [];
      chunk.split("\r\n").forEach((csvRow) => {
        const csvRowJson = {};
        csvRow.split(",").forEach((value, index) => {
          const key = headers[index];
          csvRowJson[key] = value.trim();
        });
        preJsonChunk.push(csvRowJson);
      });
      const jsonChunk = JSON.stringify(preJsonChunk);

      if (isFirstWrite) {
        isFirstWrite = false;
      }

      // Only write the objects to the file and not the array containing the
      // objects. So, from this [{...},{...}] to this {...},{...}
      callback(null, jsonChunk.substring(1, jsonChunk.length - 1));
    },
  });

  return convert;
})();

readStream.pipe(convertToJson).pipe(writeStream);
