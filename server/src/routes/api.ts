import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { anonymousUser } from '../middleware/anonymousUser';
import { validate } from '../middleware/validate';
import { MongoCollectionRepository } from '../repositories/CollectionRepository';
import { ProfileController } from '../controllers/ProfileController';
import { SnifferController } from '../controllers/SnifferController';
import { ExchangeController } from '../controllers/ExchangeController';
import { GobblerController } from '../controllers/GobblerController';
import { BigClueController } from '../controllers/BigClueController';
import { NearbyGenerationService } from '../services/NearbyGenerationService';
import { BigClueService } from '../services/BigClueService';
import { CollectionService } from '../services/CollectionService';
import { ClueEconomyService } from '../services/ClueEconomyService';
import { GobblerService } from '../services/GobblerService';
import { UserProgressionService } from '../services/UserProgressionService';
import { asyncHandler } from '../utils/asyncHandler';
import { collectBody, devGrantBody, encounterBody, exchangeBody, gobblerStartBody, linkBody, locationQuery } from '../validation/schemas';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { randomUUID } from 'crypto';

const claims = new MongoCollectionRepository();
const nearby = new NearbyGenerationService(env.sessionSecret);
const bigClue = new BigClueService();
const collection = new CollectionService(nearby, claims, bigClue);
const profileController = new ProfileController(new UserProgressionService());
const snifferController = new SnifferController(nearby, collection);
const exchangeController = new ExchangeController(new ClueEconomyService(bigClue));
const gobblerController = new GobblerController(new GobblerService(claims, bigClue));
const bigClueController = new BigClueController(bigClue);

const actionLimiter = rateLimit({ windowMs: 60_000, limit: 90, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { code: 'CLUE_FREQUENCY_EXCESSIVE', message: 'Clue operations are arriving faster than they can be ceremonially stamped.' } } });
export const apiRouter = Router();

apiRouter.use(anonymousUser);
apiRouter.get('/profile', profileController.get);
apiRouter.post('/profile/select-mode', actionLimiter, asyncHandler(profileController.selectMode));
apiRouter.post('/profile/choose', actionLimiter, asyncHandler(profileController.choose));
apiRouter.get('/sniffer/nearby', validate(locationQuery, 'query'), asyncHandler(snifferController.getNearby));
apiRouter.post('/sniffer/collect', actionLimiter, validate(collectBody), asyncHandler(snifferController.collect));
apiRouter.post('/exchange', actionLimiter, validate(exchangeBody), asyncHandler(exchangeController.exchange));
apiRouter.post('/gobbler/start', actionLimiter, validate(gobblerStartBody), asyncHandler(gobblerController.start));
apiRouter.post('/gobbler/fire', actionLimiter, validate(encounterBody), asyncHandler(gobblerController.fire));
apiRouter.post('/gobbler/gobble', actionLimiter, validate(encounterBody), asyncHandler(gobblerController.gobble));
apiRouter.post('/gobbler/spew', actionLimiter, asyncHandler(gobblerController.spew));
apiRouter.get('/big-clue/status', asyncHandler(bigClueController.status));
apiRouter.get('/big-clue/pieces', asyncHandler(bigClueController.pieces));
apiRouter.post('/big-clue/link', actionLimiter, validate(linkBody), asyncHandler(bigClueController.link));

if (env.devTools) {
  apiRouter.post('/dev/grant', validate(devGrantBody), asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.clueUser!._id, { $inc: req.body }, { new: true });
    if (req.body.jickerJigs > 0) await Promise.all(Array.from({ length: req.body.jickerJigs }, () => bigClue.materializePiece(req.clueUser!._id, `dev:${randomUUID()}`)));
    res.json({ profile: new UserRepository().toProfile(user!) });
  }));
}
