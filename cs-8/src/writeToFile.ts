import * as fs from "node:fs";

export const writeToFile = (
  filePath: string,
  data: any,
): void => {
  const content = JSON.stringify(data, null, 2);
  console.log('write to file', filePath)
  
  fs.writeFile(filePath, content, (err: Error | null) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully');
  });
}