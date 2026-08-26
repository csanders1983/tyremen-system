const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const inputPath = path.join(__dirname, "src", "data", "tyres.csv");
const outputPath = path.join(__dirname, "src", "data", "tyres.json");

try {
  const csvText = fs.readFileSync(inputPath, "utf8");

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(records, null, 2),
    "utf8"
  );

  console.log(`Converted ${records.length} tyres`);
  console.log(`Saved to ${outputPath}`);
} catch (error) {
  console.error("Conversion failed:", error.message);
  process.exit(1);
}