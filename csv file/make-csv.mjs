import fs from "node:fs";

const outputFile = process.argv[2] || "big.csv";
const sizeMB = Number(process.argv[3]) || 50;

const targetSize = sizeMB * 1024 * 1024;

const stream = fs.createWriteStream(outputFile);

stream.write("id,name,email\n");

let id = 1;

function writeData() {
  let canContinue = true;

  while (canContinue && stream.bytesWritten < targetSize) {
    const row = `${id},User${id},user${id}@gmail.com\n`;

    canContinue = stream.write(row);

    id++;
  }

  // Backpressure handle
  if (!canContinue) {
    stream.once("drain", writeData);
  } else {
    stream.end();
  }
}

stream.on("finish", () => {
  console.log(`CSV created: ${outputFile}`);
  console.log(`Rows: ${id - 1}`);
});

stream.on("error", (err) => {
  console.error("Error:", err);
});

writeData();