# **csv-to-json**

- Transforms a .csv file into a .json file
- The header values in the CSV are used as the JSON object keys.
  - First row of the CSV is treated as the header.
- Each row is transformed into a JSON object.
- The final .json file will be a single array with N objects.
  - N = number of rows in the .csv file.

## Why does this exist? There are NPM packages that do exactly this.

I want to understand how this process works and deepen my knowledge with Node  
I/O streams.

## How to use this package.

```js
// First, import this package.
const { csvToJson } = require("@bshowen/csv-to-json");
// csvToJson requires the following two options.
const options = {
  inputFilePath: "path/to/your/csv/data.csv",
  outputFilePath: "path/where/you/want/the/json/data/",
};

// You can use .catch to catch any errors or use a try/catch block.
csvToJson(options)
  .catch((err) => console.log(err.message))
  .then(() => {
    // Hurray, no errors. Do some other stuff here...
  });

// Usage with a try catch block.
async function run() {
  try {
    await csvToJson(options);
    // Hurray, no errors. Do some other stuff here...
  } catch (err) {
    console.log(err);
  }
}
run();
```

Now you will have a new file with a valid JSON array. Each item in the array  
representing a single row of your CSV data.

## Options

csvToJson accepts the following options in the form of an object.

|     Option     | Required |  Type  |                             Example                             |
| :------------: | :------: | :----: | :-------------------------------------------------------------: |
| inputFilePath  |   Yes    | String |   `{ inputFilePath: path.resolve(__dirname, "myFile.csv") }`    |
| outputFilePath |   Yes    | String | `{ outputFilePath: path.resolve(__dirname, "./outputFolder") }` |
| outputFileName |    No    | String |             `{ outputFileName: "myFileName.json" }`             |

**An example using all options.**

```js
const { csvToJson } = require("@bshowen/csv-to-json");
const path = require("node:path");

csvToJson({
  inputFilePath: path.resolve(__dirname, "../myFiles/weatherData.csv"),
  outputFilePath: path.resolve(__dirname, "../formattedFiles"),
  outputFileName: "weatherData.json",
})
  .catch((err) => console.log(err.message))
  .then(() => {
    // Hurray, no errors. Do some other stuff here...
  });
```

## How it works.

Heres a high level overview. I am processing the CSV one chunk at a time. When  
a chunk of data is received it is transformed from comma separated values into  
JSON objects. Those JSON objects are then written to the output file and this  
process gets repeated until no more chunks are received.

I learned quickly that you cannot parse an entire file into memory _and then_  
try to operate on that data. With small files this is possible, but with larger  
files I ran into memory issues. I wasn't able to continue this approach so  
I came up with the solution of reading, transforming, and writing each chunk as  
they are received.

## Notes

[This article](https://blog.logrocket.com/working-node-js-streams/) came in extremely useful when I was trying to decrypt the node.js
docs.

- https://blog.logrocket.com/working-node-js-streams/
