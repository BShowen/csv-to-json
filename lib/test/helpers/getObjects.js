const { createReadStream } = require("node:fs");

// This module exports two functions.
// The first function will read a JSON file and return the last N objects as an
// array of length N.
// The second function will read a JSON file and return the first N objects as
// an array of length N.

module.exports = {
  getLastObject: ({ filePath, count }) => {
    let readStream = createReadStream(filePath);
    let latestBuffer;
    const _getObjects = (count) => {
      // This function cleans up the JSON that was read from the final read
      // event from node. The JSON is most likely not valid, like this...
      //     "e":"e" <--The rest of this JSON is in the previous buffer.
      //   },
      //   {
      //     "f": "f",
      //     "g": "g",
      //   },
      //   {
      //     "h": "h",
      //     "i": "i",
      //   },
      // ];
      // And this will be cleaned up to look like this...
      // [
      //   {
      //     "f": "f",
      //     "g": "g",
      //   },
      //   {
      //     "h": "h",
      //     "i": "i",
      //   },
      // ];

      const brokenJson = latestBuffer.toString();

      // Get the first index of "}," in the buffer. This is the closing
      // brace for the very first json object in this buffer - which is most
      // likely broken, so it needs to be removed. Add 2 to the result of
      // indexOf() because the "}," characters need to be removed using slice()
      const closingBrokenJsonBrace = brokenJson.indexOf("},") + 2;

      // Add an opening bracket to the JSON, because it currently only has the
      // closing bracket.
      const cleanJson = "[" + brokenJson.slice(closingBrokenJsonBrace);
      // Parse this, now valid, JSON and return the number of objects requested.
      return JSON.parse(cleanJson).slice(-count);
    };

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        readStream.pause();
        // Store this buffer, overwriting the previous buffer. We are only
        // interested in the last buffer received.
        latestBuffer = data;
        readStream.resume();
      });

      readStream.on("end", async () => {
        // The last buffer has been received. Process it and return the objects.
        return resolve(_getObjects(count));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
  getFirstObject: ({ filePath, count }) => {
    let readStream = createReadStream(filePath);
    let initialBuffer;
    const _getObjects = (count) => {
      // This function cleans up the JSON that was read from the initial read
      // event from node. The JSON is most likely not valid, like this...
      // [
      //   {
      //     "a":"a",
      //     "aa":"aa"
      //   },
      //   {
      //     "b":"b",
      //     "bb":"bb"
      //   },
      //   {
      //     "c": "c", <---The rest of this json is in the next buffer
      // And this will be cleaned up to look like this...
      // [
      //   {
      //     "a":"a",
      //     "aa":"aa"
      //   },
      //   {
      //     "b":"b",
      //     "bb":"bb"
      //   }
      // ]

      // Split the json into an array of chars.
      const brokenJson = initialBuffer.toString().split("");

      // Get the index of the last closing brace and remove everything after it.
      brokenJson.splice(brokenJson.lastIndexOf("}") + 1);

      // Add the closing bracket and and return the first N objects.
      return JSON.parse(brokenJson.join("") + "]").slice(0, count);
    };

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        // We only want the first buffer read from the file.
        // When it's received, store it and destroy the readStream.
        initialBuffer = data;
        readStream.destroy();
        return resolve(_getObjects(count));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
};
