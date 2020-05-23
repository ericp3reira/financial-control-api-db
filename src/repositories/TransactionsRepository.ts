import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeList = await this.find({ where: { type: 'income' } });
    const outcomeList = await this.find({ where: { type: 'outcome' } });

    const income = incomeList.reduce(
      (acc, item) => acc + Number(item.value),
      0,
    );
    const outcome = outcomeList.reduce(
      (acc, item) => acc + Number(item.value),
      0,
    );
    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
