import type { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import type { GobblerService } from '../services/GobblerService';

export class GobblerController {
  private readonly users = new UserRepository();
  constructor(private readonly gobbler: GobblerService) {}
  start = async (req: Request, res: Response): Promise<void> => { const { targetItemId, targetType } = req.body; const encounter = await this.gobbler.start(req.clueUser!, targetItemId, targetType); res.status(201).json({ encounter }); };
  fire = async (req: Request, res: Response): Promise<void> => { const result = await this.gobbler.fire(req.clueUser!, req.body.encounterId); res.json(result); };
  gobble = async (req: Request, res: Response): Promise<void> => { res.json(await this.gobbler.gobble(req.clueUser!, req.body.encounterId)); };
  spew = async (req: Request, res: Response): Promise<void> => { const result = await this.gobbler.spew(req.clueUser!); res.json({ loot: result.loot, profile: this.users.toProfile(result.user) }); };
}
