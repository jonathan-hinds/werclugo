import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('production static server and SPA fallback', () => {
  const priorNodeEnv = process.env.NODE_ENV;
  const priorSecret = process.env.SESSION_SECRET;

  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'production-smoke-secret-that-is-stable';
    vi.resetModules();
  });
  afterAll(() => {
    if (priorNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = priorNodeEnv;
    if (priorSecret === undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET = priorSecret;
  });

  it('serves the compiled shell for a deep feature link', async () => {
    const { app } = await import('./app');
    const response = await request(app).get('/sniffer').expect(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('Wurcluego — Get a clue.');
  });

  it('keeps missing API paths structured rather than falling back to HTML', async () => {
    const { app } = await import('./app');
    const response = await request(app).get('/api/not-a-clue').expect(404);
    expect(response.body.error.code).toBe('CLUE_NOT_PRESENT');
  });
});
