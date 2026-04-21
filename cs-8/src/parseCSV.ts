import * as fs from "node:fs";
import * as readline from "node:readline";
import path from 'path';
import { fileURLToPath } from 'url';
import { writeToFile } from "./writeToFile";

export const parseCSV = (
  file: string, 
  separator: string, 
  cb: (err: Error | null, data: string[][]) => void,
): void => {
  const results: string[][] = [];
  
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity
  });
  
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = "";
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      // Обработка двойных кавычек
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
  
  rl.on('line', (line: string) => {
    if (line.trim() === "") return;
    
    const values = parseLine(line);
    
    results.push(values);
  });
  
  rl.once('close', () => {
    cb(null, results);
  });
  
  rl.once('error', (error: Error) => {
    cb(error, results);
  });
}

const callback = (error: Error | null, data: string[][]) => {
  if (error) {
    console.error('Error:', error);
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pathToOutputFile = path.join(__dirname, "../output/outputCSV.txt");
    writeToFile(pathToOutputFile, data);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToCSV = path.join(__dirname, "../input/10mb.csv");

parseCSV(pathToCSV, ',', callback);