import { getRepository, In, getCustomRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';

import uploadConfig from '../configs/upload';
import AppError from '../errors/AppError';
import parseCSVLines from '../utils/parseCSV';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    if (!filename.match(/\.csv$/)) {
      throw new AppError('Filetype should be csv.');
    }

    const csvFilePath = path.join(uploadConfig.directory, filename);

    const parsedLines = await parseCSVLines(csvFilePath);

    await fs.promises.unlink(csvFilePath);

    const parsedCategories: string[] = [];
    const parsedTransactions = parsedLines.map(line => {
      const [title, type, value, category] = line;
      if (!parsedCategories.includes(category)) parsedCategories.push(category);

      return {
        title: title.trim(),
        type: type.trim() as 'income' | 'outcome',
        value: Number(value.trim()),
        category: category.trim(),
      };
    });

    const categoryRepository = getRepository(Category);
    const existentCategories = await categoryRepository.find({
      where: { title: In(parsedCategories) },
    });
    const existentCategoryTitles = existentCategories.map(
      category => category.title,
    );
    const newCategoriesTitles = parsedCategories.filter(category => {
      return !existentCategoryTitles.includes(category);
    });
    const newCategories = categoryRepository.create(
      newCategoriesTitles.map(title => ({
        title,
      })),
    );
    await categoryRepository.save(newCategories);

    const categories = [...existentCategories, ...newCategories];
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transactions = transactionRepository.create(
      parsedTransactions.map(transaction => {
        const { title, type, value } = transaction;
        const category_id = categories.find(
          ({ title: categoryTitle }) => categoryTitle === transaction.category,
        )?.id;
        return {
          title,
          type,
          value,
          category_id,
        };
      }),
    );
    await transactionRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
