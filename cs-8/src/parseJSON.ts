import * as fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';

try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pathToCSV = path.join(__dirname, "../input/10mb.json");
    const jsonString = fs.readFileSync(pathToCSV, 'utf8');
    JSON.parse(jsonString);
    console.log('JSON parsed successfully')
} catch (err) {
    console.error(err);
}