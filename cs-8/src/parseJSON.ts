import * as fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from "node:perf_hooks";
import * as zlib from "node:zlib";

export const parseJSON = async(): Promise<void> => {
  try {
    const startTotal = performance.now();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pathToFile = path.join(__dirname, "../input/10mb.json");

    // latency до начало парсинга
    const startRead = performance.now();
    const stream = fs.createReadStream(pathToFile, { encoding: "utf8" });
    let jsonString = "";
    let firstByteTime: number | null = null;

    for await (const chunk of stream) {
      if (firstByteTime === null) {
        firstByteTime = performance.now();
      }
      jsonString += chunk;
    }

    JSON.parse(jsonString);
    const endTotal = performance.now();

    // память
    const memoryUsage = process.memoryUsage();
    const peakMemoryMB = memoryUsage.heapUsed / 1024 / 1024;

    // размер без сжатия
    const rawSizeBytes = Buffer.byteLength(jsonString, "utf8");

    // gzip сжатие
    const compressed = zlib.gzipSync(jsonString);
    const compressedSizeBytes = compressed.length;

    console.log('JSON parsed successfully.')

    console.log("=== TIME METRICS ===");
    console.log(`Total time: ${(endTotal - startTotal).toFixed(2)} ms`);
    console.log(`Time to first byte (latency): ${(firstByteTime - startRead).toFixed(2)} ms`);

    console.log("\n=== MEMORY ===");
    console.log(`Heap used: ${peakMemoryMB.toFixed(2)} MB`);

    console.log("\n=== SIZE ===");
    console.log(`Raw size: ${(rawSizeBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Gzip size: ${(compressedSizeBytes / 1024 / 1024).toFixed(2)} MB`);

} catch (err) {
    console.error(err);
}
}

parseJSON();

