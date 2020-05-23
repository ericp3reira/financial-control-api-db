import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const storedTransaction = await transactionRepository.findOne(id);

    if (!storedTransaction) {
      throw new AppError('There is no transaction with id');
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
