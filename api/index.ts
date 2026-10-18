import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/server/app.ts';

/**
 * Vercel Serverless Function Entry Point
 * Handles MCP Streamable HTTP and API requests in a serverless environment.
 */
let appInstance: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = getApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('Serverless function error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'SERVERLESS_FUNCTION_ERROR',
        message: err?.message || 'Unexpected invocation error'
      });
    }
  }
}
