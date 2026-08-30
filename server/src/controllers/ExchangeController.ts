import type { Request, Response } from 'express';
import type { ExchangeOperation } from '@wurcluego/shared';
import { UserRepository } from '../repositories/UserRepository';
import type { ClueEconomyService } from '../services/ClueEconomyService';

export class ExchangeController {
  private readonly users = new UserRepository();
  constructor(private readonly economy: ClueEconomyService) {}
  exchange = async (req: Request, res: Response): Promise<void> => {
    const { operation, amount } = req.body as { operation: ExchangeOperation; amount: number };
    const result = await this.economy.exchange(req.clueUser!, operation, amount);
    res.json({ profile: this.users.toProfile(result.user), quote: result.quote, acquiredJigs: result.acquiredJigs });
  };
}
