const fs = require("node:fs");

const buffer = [];
// const writeStream = fs.createWriteStream("./copy.csv");
fs.createReadStream("./test.csv", { encoding: "utf-8" })
  .on("data", (chunk) => {
    buffer.push(chunk);
    // writeStream.write(chunk);
  })
  .on("error", (err) => {
    console.log("There has been an error", err);
  })
  .on("end", () => {
    console.log("Done");
    const data = buffer[0].split(",,,\r\n").filter((dataString) => {
      // Filter to remove any empty strings.
      return dataString.length;
    });

    // CSV headers are the first item in the data array.
    const csvHeaderNames = data.shift().split(",");

    // Reduce the array of strings (CSV rows) into an array of objects, where
    // the keys are the header names.
    const documents = data.reduce((acc, currRow, i) => {
      // Split the string of comma separated values
      // into an array of individual strings/values.
      const csvRow = currRow.split(",");

      // Create a single object from the current string (CSV row).
      const document = csvHeaderNames.reduce(
        (rowDocument, csvHeaderName, j) => {
          rowDocument[csvHeaderName] = csvRow[j];
          return rowDocument;
        },
        {}
      );

      acc.push(document);
      return acc;
    }, []);

    console.log(documents[documents.length - 1]);
  });
