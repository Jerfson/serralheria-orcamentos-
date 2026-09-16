import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleApiRequest } from './src/server/apiRouter.js';
import { getSqliteDB } from './src/server/db.js';

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Inicializar banco de dados SQLite
const db = getSqliteDB();

const server = http.createServer(async (req, res) => {
  // 1. Roteamento de API
  const handled = await handleApiRequest(req, res, db);
  if (handled) return;

  // 2. Servir arquivos estáticos do frontend (dist/)
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let filePath = path.join(DIST_DIR, url.pathname);

  // Se pedir raiz ou diretório, serve index.html
  if (url.pathname === '/' || !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  // Verificar se o arquivo existe
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA Fallback para index.html se build existir
    const indexHtml = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      fs.createReadStream(indexHtml).pipe(res);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: auto;">
          <h2>⚠️ Frontend não compilado</h2>
          <p>Execute <code>npm run build</code> primeiro para gerar a pasta <code>dist/</code>, ou inicie em modo desenvolvimento com <code>npm run dev</code>.</p>
          <p>A API SQLite está ativa em <a href="/api/status">/api/status</a>.</p>
        </div>
      `);
    }
  }
});

server.listen(PORT, () => {
  const status = db.getStatus();
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│       SERRALHERIA JRV - SERVIDOR DE ORÇAMENTOS & PROPOSTAS  │
│                                                             │
│   🌐 Aplicação Web: http://localhost:${PORT}                 │
│   📦 Banco SQLite:  ${path.basename(status.caminhoArquivo)} (local no disco)   │
│   🔧 Motor:         Node.js nativo (node:sqlite)            │
│   📊 Orçamentos:    ${status.contagens.orcamentos} salvos                      │
└─────────────────────────────────────────────────────────────┘
`);
});
