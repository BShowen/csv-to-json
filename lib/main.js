const { createWriteStream, createReadStream } = require("node:fs");
const { access, constants } = require("node:fs/promises");
const path = require("node:path");

module.exports.csvToJson = (() => {
  let writeStream;
  let readStream;
  let isFirstWrite = true;
  let headers;

  async function _createStreams({ inputFilePath, outputFilePath }) {
    // Verify that the input file exists.
    await access(inputFilePath, constants.F_OK)
      .catch((error) => {
        // Throw the error so the calling function can handle it.
        throw new Error(`No such file or directory: ${inputFilePath}`);
      })
      .then(() => {
        // If no errors then input file exists. Create the read stream.
        readStream = createReadStream(inputFilePath);
        // Create the output file
        const outputFilename = `${path.basename(inputFilePath, ".csv")}.json`;
        const finalOutputFilePath = path.resolve(
          outputFilePath,
          outputFilename
        );
        writeStream = createWriteStream(finalOutputFilePath);
      });
  }

  function _setCsvHeaders(chunk) {
    // A function that does not modify the input and has no return value.
    // A function that receives a chunk of csv data. The first row in this chunk
    // are the csv headers. Set the "headers" variable of this module to the
    // value of this chunk's headers.

    // The headers variable is set to an array of strings. Each string is a
    // csv header value.
    headers = chunk
      .split("\r\n")[0]
      .split(",")
      .map((header) => header.trim());
  }

  function _sanitizeChunk(chunk) {
    // A function that returns a modified version of the provided chunk.
    // 1) It removes the csv headers, if they exists on this chunk, and stores
    // them in this modules "headers" variable.
    // 2) It removes any white space/empty rows from the csv chunk.

    chunk = chunk.toString();
    // Convert the Buffer to a string of values.
    if (!headers) {
      _setCsvHeaders(chunk);
      const temp = chunk.split("\r\n");
      temp.shift();
      chunk = temp.join("\r\n");
    }

    return chunk
      .split("\r\n")
      .filter((dataString) => {
        // Remove empty lines from chunk. This can happen when the last line
        // in the file is empty or if the user has empty rows in their CSV.
        return dataString.length;
      })
      .join("\r\n");
  }

  function _getJsonFromCsv(chunk) {
    // A function that does not modify it's input.
    // This function receives a chunk of data as a string. It returns the JSON
    // representation of that data.
    // The chunk received as an argument is a string of CSV rows. Each row is
    // transformed into a JSON object. Those objects are returned as a valid
    // JSON string.
    // NOTE: A JSON array is not returned, only the values of that array.
    // Example: jsonArr = '[{"a":"1"},{"b":"2"}]' and the function returns this
    // '{"a":"1"},{"b":"2"}'

    const preJsonChunk = [];
    // transform the chunk into json.
    chunk.split("\r\n").forEach((csvRow) => {
      const csvRowJson = {};
      csvRow.split(",").forEach((value, index) => {
        const key = headers[index];
        csvRowJson[key] = value.trim();
      });
      preJsonChunk.push(csvRowJson);
    });

    return JSON.stringify(preJsonChunk).slice(1, -1);
  }

  return async ({ inputFilePath, outputFilePath }) => {
    if (!inputFilePath) {
      throw new Error("inputFilePath not provided.");
    } else if (!outputFilePath) {
      throw new Error("outputFilePath not provided.");
    }

    await _createStreams({ inputFilePath, outputFilePath });

    readStream.on("data", (data) => {
      // Pause the readStream so that we have time to process and write this
      // chunk.This will prevent backpressure on the readStream.
      readStream.pause();

      // Extract headers and remove whitespace.
      const chunk = _sanitizeChunk(data);

      // Convert the CSV chunk into a JSON chunk.
      const jsonChunk = _getJsonFromCsv(chunk);

      if (isFirstWrite) {
        // If this is the first time we are writing to the file, then write an
        // opening bracket, otherwise write a comma.
        // Why?
        // The output file is a single JSON array.The file MUST begin with
        // an opening bracket --> [.
        writeStream.write("[");
        isFirstWrite = false;
      } else {
        writeStream.write(",");
        // Why the comma?
        // After each JSON object is written to the file, there needs to be a
        // comma inserted(except on the last element).
        // For example...
        // correct-- > [{}, {}]
        // incorrect --> [{},{},] //notice the trailing comma.
        // Each comma is written to file ONLY wen there is more data waiting to
        // be written to the file, which is why the comma is written before we
        // write a new JSON object.
      }

      // Write the json chunk to the output file. Resume readStream upon
      // successful write.
      writeStream.write(jsonChunk, () => {
        readStream.resume();
      });
    });

    // Listen for the emitter to emit "end". This is when the last json
    // bracket ] is written to the file, thus completing the JSON file.
    readStream.on("end", () => {
      writeStream.write("]");
      writeStream.end();

      // Set to default.
      isFirstWrite = true;
      headers = undefined;
    });
  };
})();
