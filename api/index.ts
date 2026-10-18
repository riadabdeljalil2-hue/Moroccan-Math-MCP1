import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/server/app.ts';

/**
 * Vercel Serverless Function Entry Point
 * Handles MCP Streamable HTTP and API requests in a serverless environment.
 */
const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Delegate incoming serverless request to our configured Express MCP app
  return app(req as any, res as any);
}
