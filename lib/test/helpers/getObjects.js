const { createReadStream } = require("node:fs");
module.exports = {
  getLastObject: ({ filePath, count }) => {
    let readStream = createReadStream(filePath);
    let lastReadData;
    const _getObjects = (count) => {
      // This function cleans up the JSON that was read from the final read
      // event from node. The JSON is most likely not valid, like this...
      //     "e":"e"
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

      const brokenJson = lastReadData.toString();

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
        lastReadData = data;
        readStream.resume();
      });

      readStream.on("end", async () => {
        return resolve(_getObjects(count));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
  getFirstObject: ({ filePath, count }) => {
    let readStream = createReadStream(filePath);
    let lastReadData;
    const _getObjects = (count) => {
      const brokenJson = lastReadData.toString().split("");
      brokenJson.splice(brokenJson.lastIndexOf(","));
      return JSON.parse(brokenJson.join("") + "}]").slice(0, count);
    };

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        lastReadData = data.toString();
        readStream.destroy();
        return resolve(_getObjects(count));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
};
