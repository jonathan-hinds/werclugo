import 'dotenv/config';
import { createHash } from 'node:crypto';
import { z } from 'zod';

const developmentSessionSecret = 'development-clue-secret-change-me';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1).default('mongodb+srv://jonathandhd:Jonnumber14@cluster0.fwdtteo.mongodb.net/wurcluego?retryWrites=true&w=majority&appName=Cluster0'),
  SESSION_SECRET: z.string().min(16).optional(),
  CORS_ORIGIN: z.string().optional(),
  ENABLE_DEV_TOOLS: z.enum(['true', 'false']).default('false'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // This must remain visible even when structured logging cannot initialize.
  console.error('Wurcluego configuration is not clue-compliant:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const sessionSecret = parsed.data.SESSION_SECRET ?? (
  parsed.data.NODE_ENV === 'production'
    ? createHash('sha256')
        .update('wurcluego-session-v1\0')
        .update(parsed.data.MONGODB_URI)
        .digest('hex')
    : developmentSessionSecret
);

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  mongoUri: parsed.data.MONGODB_URI,
  sessionSecret,
  corsOrigin: parsed.data.CORS_ORIGIN,
  devTools: parsed.data.NODE_ENV !== 'production' && parsed.data.ENABLE_DEV_TOOLS === 'true',
};
