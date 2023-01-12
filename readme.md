# csv-to-json

- Copies a .csv file into a .json file
- The header values in the CSV are used as the JSON object keys.
  - First row of the CSV is treated as the header.
- Each row is transformed into a JSON object.
- The final .json file will be a single array with N objects.
  - N = number of rows in the .csv file.

## Why does this exist? There are NPM packages that do exactly this.

I want to understand how this process works and deepen my knowledge with Node  
I/O streams.

## usage

```js
// Create read and write streams.
const { createWriteStream, createReadStream } = require("node:fs");
const inputStream = createReadStream("path/to/file.csv");
const outputStream = createWriteStream("path/where/you/want/output/file.json");

// Import this package.
const transform = require(path.resolve(__dirname, "../main"));

// Initialize the transformer.
const toJson = transform({
  readStream: inputStream,
  writeStream: outputStream,
});

// Lets transform the csv to json.
read.pipe(toJson).pipe(write);
```

Now you will have a new file with valid JSON representation of your CSV data.

## How it works.

Heres a high level overview. I am processing the CSV one chunk at a time. When  
a chunk of data is received it is transformed from comma separated values into  
JSON objects. Those JSON objects are then written to the output stream and this  
process gets repeated until no more chunks are received.

I learned quickly that you cannot parse an entire file into memory _and then_  
try to operate on that data. With small files this is possible, but with larger  
files I ran into issues with memory. I wasn't able to continue this approach so  
I came up with the solution of reading, transforming, and writing each chunk as  
they are received.

## Notes

[This article](https://blog.logrocket.com/working-node-js-streams/) came in extremely useful when I was trying to decrypt the node.js
docs.

- https://blog.logrocket.com/working-node-js-streams/
