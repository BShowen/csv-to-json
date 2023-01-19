//Goal: Call this script and it will call your callback, error first,
// with an additional object. The object will be returned only when there
// was not an error, otherwise undefined will be returned and an error
// passed in as the first param.

// The object will have these fields.
// csvPath: An absolute path to the generated CSV file.
// data: An array of objects, each object is a row in the CSV, in order.

const path = require("node:path");
const { faker } = require("@faker-js/faker/locale/en");
const { createWriteStream, writeFile, write } = require("node:fs");

module.exports = (() => {
  const MAX_ROWS = 20000;
  const MIN_ROWS = 1;
  let isFirstWrite = true;

  const _generateRow = () => {
    const jsonRow = {
      userId: faker.datatype.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.date.past(),
    };

    let csvRow = "";
    if (isFirstWrite) {
      // If this is the first write, then we need to set the headers
      // for the csv.
      isFirstWrite = false;
      csvRow = `${Object.keys(jsonRow)}\r\n`;
    }
    csvRow += `${Object.values(jsonRow)}`;

    return { csvRow, jsonRow };
  };

  const _generateData = (callerOptions = {}) => {
    const csvRows = { json: [], csv: [] };
    const defaults = { rows: MIN_ROWS };
    const options = Object.assign({}, defaults, callerOptions);

    // sanitize options
    if (options.rows > MAX_ROWS)
      throw new Error(`Max allowed rows: ${MAX_ROWS}`);

    const { rows } = options;
    for (let i = 0; i < rows; i++) {
      const { jsonRow, csvRow } = _generateRow();
      csvRows.json.push(jsonRow);
      csvRows.csv.push(csvRow);
    }

    return csvRows;
  };

  return {
    generate: (cb, options) => {
      try {
        if (!options.destination)
          throw new Error("Destination must be provided.");

        let csvRows = _generateData(options);
        writeFile(
          path.resolve(options.destination, options.fileName || "output.csv"),
          // JSON.stringify(csvRows),
          csvRows.csv.join("\r\n"),
          (err) => {
            if (err) {
              cb(err, undefined);
            } else {
              cb(undefined, { rows: csvRows.json });
            }
          }
        );
      } catch (e) {
        cb(e, undefined);
      } finally {
        // Reset the module so it can be called again.
        isFirstWrite = true;
      }
    },
    cb: (err, data) => {
      if (err) {
        console.log("Heres the error: ", err);
      } else {
        console.log(data);
      }
    },
  };
})();
