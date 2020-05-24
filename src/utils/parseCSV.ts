import fs from 'fs';
import csvParse from 'csv-parse';

import AppError from '../errors/AppError';

const parseCSVLines = async (filepath: string): Promise<string[][]> => {
  try {
    const lines: string[][] = [];
    const csvReadStream = fs.createReadStream(filepath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = csvReadStream.pipe(parseStream);

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', () => {
        resolve();
      });
    });

    return lines;
  } catch (error) {
    throw new AppError('Error parsing the CSV file');
  }
};

export default parseCSVLines;
