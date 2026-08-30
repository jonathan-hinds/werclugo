import { z } from 'zod';

export const locationQuery = z.object({ lat: z.coerce.number().min(-90).max(90), lon: z.coerce.number().min(-180).max(180) });
export const collectBody = z.object({ itemId: z.string().min(10).max(160), lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) });
export const exchangeBody = z.object({ operation: z.enum(['coins_to_points', 'jig_to_coins', 'jig_to_points', 'points_to_jig_attempt']), amount: z.number().int().min(1).max(100) });
export const gobblerStartBody = z.object({ targetItemId: z.string().min(10).max(160), targetType: z.enum(['coin', 'jig']) });
export const encounterBody = z.object({ encounterId: z.string().uuid() });
export const linkBody = z.object({ firstId: z.string().min(4).max(80), secondId: z.string().min(4).max(80) });
export const devGrantBody = z.object({ clueCoins: z.number().int().min(0).max(1000).default(0), puzzlePoints: z.number().int().min(0).max(1000).default(0), jickerJigs: z.number().int().min(0).max(20).default(0) });
