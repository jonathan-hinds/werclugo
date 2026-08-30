import type { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import type { UserProgressionService } from '../services/UserProgressionService';

export class ProfileController {
  private readonly users = new UserRepository();
  constructor(private readonly progression: UserProgressionService) {}
  get = (req: Request, res: Response): void => { res.json({ profile: this.users.toProfile(req.clueUser!) }); };
  selectMode = async (req: Request, res: Response): Promise<void> => { const user = await this.progression.selectMode(req.clueUser!); res.json({ profile: this.users.toProfile(user!) }); };
  choose = async (req: Request, res: Response): Promise<void> => { const user = await this.progression.choose(req.clueUser!); res.json({ profile: this.users.toProfile(user!) }); };
}
