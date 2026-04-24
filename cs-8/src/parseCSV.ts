import * as fs from "node:fs";
import * as readline from "node:readline";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "node:perf_hooks";
import * as zlib from "node:zlib";

export const parseCSV = async (
  inputFile: string,
  outputFile: string,
  separator: string
): Promise<void> => {
  const startTotal = performance.now();
  const startRead = performance.now();

  let firstRowTime: number | null = null;
  let peakHeap = 0;

  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = "";
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentValue += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (char === separator && !inQuotes) {
        values.push(currentValue);
        currentValue = "";
        i++;
        continue;
      }

      currentValue += char;
      i++;
    }

    values.push(currentValue);
    return values;
  };

  for await (const line of rl) {
    if (line.trim() === "") continue;

    if (firstRowTime === null) {
      firstRowTime = performance.now();
    }

    const values = parseLine(line);

    writeStream.write(values.join("|") + "\n");

    const heapUsed = process.memoryUsage().heapUsed;
    if (heapUsed > peakHeap) {
      peakHeap = heapUsed;
    }
  }

  writeStream.end();

  const endTotal = performance.now();

  const stats = fs.statSync(inputFile);
  const rawSizeBytes = stats.size;

  const gzip = zlib.createGzip();
  const source = fs.createReadStream(inputFile);

  let compressedSizeBytes = 0;

  await new Promise<void>((resolve, reject) => {
    source
      .pipe(gzip)
      .on("data", (chunk) => {
        compressedSizeBytes += chunk.length;
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log("CSV parsed successfully.");

  console.log("\n=== TIME METRICS ===");
  console.log(`Total time: ${(endTotal - startTotal).toFixed(2)} ms`);
  console.log(
    `Time to first row (latency): ${(firstRowTime! - startRead).toFixed(2)} ms`
  );

  console.log("\n=== MEMORY ===");
  console.log(
    `Peak heap used: ${(peakHeap / 1024 / 1024).toFixed(2)} MB`
  );

  console.log("\n=== SIZE ===");
  console.log(
    `Raw size: ${(rawSizeBytes / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `Gzip size: ${(compressedSizeBytes / 1024 / 1024).toFixed(2)} MB`
  );

  console.log("\n=== STATS ===");
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "../input/10mb.csv");
const outputPath = path.join(__dirname, "../output/output_stream.txt");

parseCSV(inputPath, outputPath, ",");