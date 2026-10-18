import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import { createApp } from './src/server/app.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApp();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middleware in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve pre-built static assets in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Moroccan Math MCP Server (المنهاج المغربي للرياضيات)`);
    console.log(` Server active on: http://0.0.0.0:${PORT}`);
    console.log(` MCP Streamable HTTP: http://0.0.0.0:${PORT}/mcp`);
    console.log(` MCP Classic SSE:     http://0.0.0.0:${PORT}/sse`);
    console.log(` Health Check API:    http://0.0.0.0:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Moroccan Math MCP server:', err);
  process.exit(1);
});
