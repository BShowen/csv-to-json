const path = require("node:path");

// A module that defines all the paths required for testing.
// Do NOT change OUTPUT_DIR otherwise jest will go into an infinite loop.
// Jest is watching for file changes and will re-run tests when a file is
// changed. These tests create and remove files in the process, which tells
// jest to re-run the tests, which create new files, which tells jest to re-run
// the tests, which create new files, which tells jest to ... you get it.
module.exports = {
  INPUT_DIR: path.resolve(__dirname, "../inputFiles"),
  OUTPUT_DIR: path.resolve(__dirname, "../tmp"),
  SMALL_TEST_FILE: "small.csv",
  LARGE_TEST_FILE: "large.csv",
};
