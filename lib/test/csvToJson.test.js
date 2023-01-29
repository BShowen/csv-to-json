const { csvToJson } = require("../../index");
const path = require("node:path");
const { mkdir } = require("node:fs/promises");
const { rmSync } = require("node:fs");
const {
  INPUT_DIR,
  OUTPUT_DIR,
  SMALL_TEST_FILE,
  LARGE_TEST_FILE,
} = require("./helpers/defaultDirectories");
const { getUniqueName } = require("./helpers/uniqueFileName");
const { outputFileExists } = require("./helpers/outputFileExists");
const { getFirstLines, getLastLines } = require("./helpers/getLines");
const { getFirstObject, getLastObject } = require("./helpers/getObjects");

describe("This package", () => {
  test("Exports a function", () => {
    expect(typeof csvToJson).toBe("function");
  });

  it("Will only process CSV files", async () => {
    expect.assertions(1);
    try {
      await csvToJson({
        inputFilePath: path.resolve(__dirname, "./foo/bar/baz.xls"),
        outputFilePath: "./",
      });
    } catch (e) {
      expect(e.message).toBe("Your input file is not a .csv file.");
    }
  });
});

describe("Test all possible errors thrown by this package", () => {
  it("Throws an error when inputFilePath is not provided", async () => {
    expect.assertions(1);
    try {
      await csvToJson({ inputFilePath: undefined, outputFilePath: "./" });
    } catch (e) {
      expect(e.message).toBe("InputFilePath not provided.");
    }
  });

  it("Throws an error when outputFilePath is not provided", async () => {
    expect.assertions(1);
    try {
      await csvToJson({
        inputFilePath: "./data.csv",
        outputFilePath: undefined,
      });
    } catch (e) {
      expect(e.message).toBe("OutputFilePath not provided.");
    }
  });

  it("Throws an error when we cannot find the input file", async () => {
    expect.assertions(1);
    try {
      await csvToJson({
        inputFilePath: "./foo/bar/baz.csv",
        outputFilePath: "./",
      });
    } catch (e) {
      expect(e.message).toMatch("No such file or directory:");
    }
  });
});

// I want to make sure that all CSV rows are being processed, for for large and small csv.
describe("Processing a csv", () => {
  beforeAll(async () => {
    // Before tests begin, create the directory where tests will write to.
    await mkdir(OUTPUT_DIR);
  });

  afterAll(() => {
    // After tests are complete, remove the tmp directory that was created
    // before tests were started.
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  });

  it("Properly names and places the output file", async () => {
    const outputFileName = getUniqueName();
    // Process the .csv file
    await csvToJson({
      inputFilePath: path.resolve(INPUT_DIR, SMALL_TEST_FILE),
      outputFilePath: OUTPUT_DIR,
      outputFileName,
    });

    // Expect the .json file to be at outputFilePath dir.
    expect(await outputFileExists(outputFileName)).toBe(true);
  });

  it("Parses every row of large csv files", async () => {
    // This is quite the test.
    // First, this test converts the large.csv file into a .json file.
    // Then we get the first and last row from the large csv file.
    // Then we get the first and last JSON objects from the json file.
    // Then we compare those rows and json objects to make sure they hold the
    // same values.

    // The logic here is that if the first row and first json object match AND
    // the last row and last json object match, then we have successfully
    // read and converted all the csv rows to json objects.

    const outputFileName = getUniqueName();

    // Convert the large csv file into a json file.
    await csvToJson({
      inputFilePath: path.resolve(INPUT_DIR, LARGE_TEST_FILE),
      outputFilePath: OUTPUT_DIR,
      outputFileName,
    });

    // Expect the .json file to be at outputFilePath dir.
    expect(await outputFileExists(outputFileName)).toBe(true);

    // get the first and last row from the csv file.
    const firstCsvRow = await getFirstLines({
      filePath: path.resolve(INPUT_DIR, LARGE_TEST_FILE),
      lines: 2,
    }).then((data) => data[1].split(","));

    const lastCsvRow = await getLastLines({
      filePath: path.resolve(INPUT_DIR, LARGE_TEST_FILE),
      lines: 1,
    }).then((data) => data[0].split(","));

    // get the first and last json object from the json file.
    const firstJsonObject = await getFirstObject({
      filePath: path.resolve(OUTPUT_DIR, outputFileName),
      count: 1,
    }).then((data) => data[0]);

    const lastJsonObject = await getLastObject({
      filePath: path.resolve(OUTPUT_DIR, outputFileName),
      count: 1,
    }).then((data) => data[0]);

    // Compare those to the first and last rows in the .csv file.
    // They should both have the same data.
    // If they don't then something is wrong and not all csv rows are being parsed.
    const firstRowsMatch = Object.values(firstJsonObject).every((value, i) => {
      return value === firstCsvRow[i];
    });

    const lastRowsMatch = Object.values(lastJsonObject).every((value, i) => {
      return value === lastCsvRow[i];
    });

    expect(firstRowsMatch).toBe(true);
    expect(lastRowsMatch).toBe(true);
  });
});

// I want to make sure that CSV headers are being used as JSON keys.
