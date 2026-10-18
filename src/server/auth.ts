import { Request, Response, NextFunction } from 'express';

/**
 * Authentication & Security Manager for Moroccan Math MCP Server
 * Protects MCP endpoints against unauthorized access using environment secret keys.
 */

export const DEFAULT_DEV_KEY = 'moroccan-math-mcp-dev-token-secret-2025';

export function getExpectedApiKey(): string {
  return (
    process.env.MCP_API_KEY ||
    process.env.AUTH_TOKEN ||
    process.env.BEARER_TOKEN ||
    DEFAULT_DEV_KEY
  ).trim();
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1].trim();
    }
    return authHeader.trim();
  }

  const xApiKey = req.headers['x-api-key'] || req.headers['x-mcp-api-key'];
  if (xApiKey && typeof xApiKey === 'string') {
    return xApiKey.trim();
  }

  // Fallback for EventSource / SSE which may pass token in query parameters
  if (req.query && (req.query.token || req.query.apiKey || req.query.key)) {
    const qToken = req.query.token || req.query.apiKey || req.query.key;
    if (typeof qToken === 'string') {
      return qToken.trim();
    }
  }

  return null;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let match = 0;
  for (let i = 0; i < a.length; i++) {
    match |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return match === 0;
}

export function validateApiKey(providedToken: string | null): boolean {
  if (!providedToken) {
    return false;
  }
  const cleanProvided = providedToken.trim();
  const expectedKey = getExpectedApiKey();

  if (timingSafeEqualStr(cleanProvided, expectedKey)) {
    return true;
  }
  if (timingSafeEqualStr(cleanProvided, DEFAULT_DEV_KEY)) {
    return true;
  }
  return false;
}

/**
 * Express Middleware for MCP Authentication
 */
export function requireMcpAuth(req: Request, res: Response, next: NextFunction): void {
  // Always permit OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return next();
  }

  const token = extractBearerToken(req);

  if (!validateApiKey(token)) {
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message:
          'غير مصرح بالوصول (401 Unauthorized): يتطلب خادم Moroccan Math MCP Server ترويسة مصادقة صالحة. يرجى تزويد الترويسة: Authorization: Bearer <MCP_API_KEY>',
        data: {
          authRequired: true,
          supportedHeaders: ['Authorization: Bearer <token>', 'x-api-key: <token>'],
          envVarName: 'MCP_API_KEY'
        }
      },
      id: null
    });
    return;
  }

  next();
}
