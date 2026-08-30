import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/wurcluego'),
  SESSION_SECRET: z.string().min(16).default('development-clue-secret-change-me'),
  CORS_ORIGIN: z.string().optional(),
  ENABLE_DEV_TOOLS: z.enum(['true', 'false']).default('false'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // This must remain visible even when structured logging cannot initialize.
  console.error('Wurcluego configuration is not clue-compliant:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.SESSION_SECRET === 'development-clue-secret-change-me') {
  console.error('SESSION_SECRET must be explicitly configured in production.');
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  mongoUri: parsed.data.MONGODB_URI,
  sessionSecret: parsed.data.SESSION_SECRET,
  corsOrigin: parsed.data.CORS_ORIGIN,
  devTools: parsed.data.NODE_ENV !== 'production' && parsed.data.ENABLE_DEV_TOOLS === 'true',
};
