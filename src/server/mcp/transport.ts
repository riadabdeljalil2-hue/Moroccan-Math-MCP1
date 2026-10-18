import crypto from 'crypto';
import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMoroccanMathMcpServer } from './server.ts';

/**
 * MCP Transport Manager
 * Manages Streamable HTTP transport and classic SSE transports for the Moroccan Math MCP Server.
 */

// Singleton McpServer instance for Streamable HTTP
const mcpServer = createMoroccanMathMcpServer();

// Active Streamable HTTP transport
let streamableTransport: StreamableHTTPServerTransport | null = null;
let streamableConnectPromise: Promise<void> | null = null;

export async function getStreamableTransport(): Promise<StreamableHTTPServerTransport> {
  if (!streamableTransport) {
    streamableTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID()
    });
    streamableConnectPromise = mcpServer.connect(streamableTransport);
  }
  if (streamableConnectPromise) {
    await streamableConnectPromise;
  }
  return streamableTransport;
}

/**
 * Handles incoming Streamable HTTP requests (POST, GET, DELETE) on /mcp
 */
export async function handleStreamableHttpRequest(req: Request, res: Response): Promise<void> {
  try {
    const transport = await getStreamableTransport();
    // req.body is already parsed by express.json() if present
    await transport.handleRequest(req, res, req.body);
  } catch (error: any) {
    console.error('Streamable HTTP handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Internal MCP transport error: ${error.message || String(error)}`
        },
        id: null
      });
    }
  }
}

// Map of active classic SSE transports by sessionId
const sseTransports = new Map<string, { transport: SSEServerTransport; server: ReturnType<typeof createMoroccanMathMcpServer> }>();

/**
 * Handles classic SSE connection on /sse
 */
export async function handleSseConnect(req: Request, res: Response): Promise<void> {
  try {
    const sseServer = createMoroccanMathMcpServer();
    const transport = new SSEServerTransport('/messages', res);
    const sessionId = transport.sessionId;

    sseTransports.set(sessionId, { transport, server: sseServer });

    transport.onclose = () => {
      sseTransports.delete(sessionId);
    };

    await sseServer.connect(transport);
  } catch (error: any) {
    console.error('SSE connect error:', error);
    if (!res.headersSent) {
      res.status(500).send(`Failed to establish SSE connection: ${error.message}`);
    }
  }
}

/**
 * Handles classic SSE POST messages on /messages?sessionId=...
 */
export async function handleSsePostMessage(req: Request, res: Response): Promise<void> {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).send('Missing sessionId query parameter');
    return;
  }

  const session = sseTransports.get(sessionId);
  if (!session) {
    res.status(404).send('Session not found or expired');
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res, req.body);
  } catch (error: any) {
    console.error('SSE handlePostMessage error:', error);
    if (!res.headersSent) {
      res.status(500).send(`Error processing message: ${error.message}`);
    }
  }
}
