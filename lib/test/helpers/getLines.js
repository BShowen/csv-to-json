const { createReadStream } = require("node:fs");

// This module exports two functions.
// The first function will read a file and return the first N lines as an array
// of length N.
// The second function will read a file and return the last N lines as an array
// of length N.

module.exports = {
  getLastLines: ({ filePath, lines }) => {
    const readStream = createReadStream(filePath);
    let latestBuffer;

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        readStream.pause();
        // Store this buffer, overwriting the previous buffer. We are only
        // interested in the last buffer received.
        latestBuffer = data;
        readStream.resume();
      });

      readStream.on("end", async () => {
        // The last buffer has been received.
        // Convert the buffer into a string.
        // Split the string it on CRLF, thus converting it into an array of lines.
        // Return the last N lines using Array.slice()
        return resolve(latestBuffer.toString().split("\r\n").slice(-lines));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
  getFirstLines: ({ filePath, lines }) => {
    const readStream = createReadStream(filePath);
    let firstBuffer;

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        // We only want the first buffer read from the file.
        // When it's received, store it and destroy the readStream.
        firstBuffer = data;

        // Destroy the read stream. We have our first buffer.
        readStream.destroy();

        // Convert the buffer to a string.
        // Split the string on CRLF, converting into an array of lines.
        // Return the first n lines using Array.slice()
        return resolve(firstBuffer.toString().split("\r\n").slice(0, lines));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
};
