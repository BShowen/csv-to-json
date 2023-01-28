const { readdir } = require("node:fs/promises");
const { OUTPUT_DIR } = require("./defaultDirectories");

// A function that returns true/false if the fileName is/isn't found in the
// OUTPUT_DIR.
module.exports.outputFileExists = async (fileName) => {
  const files = await readdir(OUTPUT_DIR);
  return files.some((file) => {
    return file.toString() === fileName;
  });
};
