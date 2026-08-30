import type { Request, Response } from 'express';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import type { BigClueService } from '../services/BigClueService';

export class BigClueController {
  private readonly users = new UserRepository();
  constructor(private readonly bigClue: BigClueService) {}
  status = async (_req: Request, res: Response): Promise<void> => { res.json(await this.bigClue.status()); };
  pieces = async (req: Request, res: Response): Promise<void> => { res.json({ pieces: await this.bigClue.piecesFor(req.clueUser!._id) }); };
  link = async (req: Request, res: Response): Promise<void> => { const result = await this.bigClue.link(req.clueUser!._id, req.body.firstId, req.body.secondId); const user = await User.findById(req.clueUser!._id); res.json({ ...result, profile: this.users.toProfile(user!) }); };
}
