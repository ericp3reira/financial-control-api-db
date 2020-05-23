import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (!title || !type || !value || !category) {
      throw new AppError(
        'A transaction should have: title, type, value and category',
      );
    }

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type should be "income" or "outcome"');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let storedCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!storedCategory) {
      storedCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(storedCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: storedCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
