import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Plugin to serve /api serverless functions during local development
function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        // Parse url path
        const urlPath = req.url.split('?')[0];

        // Gather request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString();
        let parsedBody: any = {};
        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = rawBody;
          }
        }
        req.body = parsedBody;

        // Custom res.status and res.json helpers
        res.status = (statusCode: number) => {
          res.statusCode = statusCode;
          return res;
        };
        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          if (urlPath === '/api/split-features') {
            const { default: handler } = await server.ssrLoadModule('/api/split-features.ts');
            return await handler(req, res);
          } else if (urlPath === '/api/parse-catalogue') {
            const { default: handler } = await server.ssrLoadModule('/api/parse-catalogue.ts');
            return await handler(req, res);
          } else if (urlPath === '/api/generate') {
            const { default: handler } = await server.ssrLoadModule('/api/generate.ts');
            return await handler(req, res);
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Endpoint not found' }));
          }
        } catch (error: any) {
          console.error('API Error in dev server:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  // Assign server env vars to process.env
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      apiDevPlugin(),
    ],
    server: {
      port: 5173,
    },
  };
});
