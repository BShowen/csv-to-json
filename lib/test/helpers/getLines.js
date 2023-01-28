const { createReadStream } = require("node:fs");
module.exports = {
  getLastLines: ({ filePath, lines }) => {
    let readStream = createReadStream(filePath);
    let stringData;
    const _getLastLines = (lines) => {
      return stringData.split("\r\n").slice(-lines);
    };

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        readStream.pause();
        stringData = data.toString();
        readStream.resume();
      });

      readStream.on("end", async () => {
        return resolve(_getLastLines(lines));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
  getFirstLines: ({ filePath, lines }) => {
    let readStream = createReadStream(filePath);
    let stringData;
    const _getLastLines = (lines) => {
      return stringData.split("\r\n").slice(0, lines);
    };

    return new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        stringData = data.toString();
        readStream.destroy();
        return resolve(_getLastLines(lines));
      });

      readStream.on("error", (error) => reject(error));
    });
  },
};
