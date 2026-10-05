import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StringDecoder } from "node:string_decoder";

const inputFile = "big.csv";
const outputFile = "output.json";

// -------------------------
// Memory Monitoring
// -------------------------

const start = Date.now();

let peakRSS = process.memoryUsage().rss;

const monitor = setInterval(() => {
  const rss = process.memoryUsage().rss;

  peakRSS = Math.max(peakRSS, rss);

  console.log(
    `Current RSS: ${(rss / 1024 / 1024).toFixed(2)} MB`
  );
}, 1000);

// -------------------------
// LineSplitter
// bytes -> lines
// -------------------------

class LineSplitter extends Transform {
  constructor() {
    super({
      readableObjectMode: true
    });

    this.tail = "";

    // Safely handle UTF-8 characters split between chunks
    this.decoder = new StringDecoder("utf8");
  }

  _transform(chunk, encoding, callback) {
    const text = this.tail + this.decoder.write(chunk);

    const lines = text.split(/\r?\n/);

    // Last part may be an incomplete line
    this.tail = lines.pop();

    for (const line of lines) {
      if (line) {
        this.push(line);
      }
    }

    callback();
  }

  _flush(callback) {
    const rest = this.tail + this.decoder.end();

    if (rest) {
      this.push(rest);
    }

    callback();
  }
}

// -------------------------
// RowsToJson
// lines -> JSON text
// -------------------------

class RowsToJson extends Transform {
  constructor() {
    super({
      writableObjectMode: true
    });

    this.headers = null;
    this.count = 0;
  }

  _transform(line, encoding, callback) {
    // First line = CSV headers
    if (!this.headers) {
      this.headers = line.split(",");
      callback();
      return;
    }

    // Convert CSV row into object
    const fields = line.split(",");

    const row = Object.fromEntries(
      this.headers.map((header, index) => [
        header,
        fields[index] ?? null
      ])
    );

    // First row starts JSON array
    const separator = this.count === 0 ? "[\n" : ",\n";

    this.push(
      separator + JSON.stringify(row)
    );

    this.count++;

    callback();
  }

  _flush(callback) {
    if (this.count === 0) {
      this.push("[]\n");
    } else {
      this.push("\n]\n");
    }

    callback();
  }
}

// -------------------------
// Pipeline
// -------------------------

try {
  await pipeline(
    fs.createReadStream(inputFile, {
      highWaterMark: 64 * 1024
    }),

    new LineSplitter(),

    new RowsToJson(),

    fs.createWriteStream(outputFile)
  );

  clearInterval(monitor);

  const finalRSS = process.memoryUsage().rss;

  console.log("\nCSV converted successfully!");

  console.log(
    "Peak RSS:",
    (peakRSS / 1024 / 1024).toFixed(2),
    "MB"
  );

  console.log(
    "Final RSS:",
    (finalRSS / 1024 / 1024).toFixed(2),
    "MB"
  );

  console.log(
    "Execution time:",
    ((Date.now() - start) / 1000).toFixed(2),
    "seconds"
  );

} catch (error) {
  clearInterval(monitor);

  console.error("Pipeline failed:", error);

  process.exitCode = 1;
}