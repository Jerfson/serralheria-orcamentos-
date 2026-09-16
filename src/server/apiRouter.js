import { getSqliteDB } from './db.js';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Proteção contra payload excessivo (máx 15MB)
      if (body.length > 15 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload muito grande'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON inválido: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req, res, dbInstance) {
  const db = dbInstance || getSqliteDB();
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Responder a preflight CORS OPTIONS
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return true;
  }

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  try {
    // --- STATUS ---
    if (pathname === '/api/status' && method === 'GET') {
      sendJson(res, 200, db.getStatus());
      return true;
    }

    // --- EMPRESA ---
    if (pathname === '/api/empresa') {
      if (method === 'GET') {
        sendJson(res, 200, db.getEmpresaConfig());
        return true;
      }
      if (method === 'POST' || method === 'PUT') {
        const body = await readJsonBody(req);
        const saved = db.saveEmpresaConfig(body);
        sendJson(res, 200, saved);
        return true;
      }
    }

    // --- CLIENTES ---
    if (pathname === '/api/clientes') {
      if (method === 'GET') {
        sendJson(res, 200, db.getClientes());
        return true;
      }
      if (method === 'POST') {
        const body = await readJsonBody(req);
        const saved = db.saveCliente(body);
        sendJson(res, 201, saved);
        return true;
      }
    }

    const clienteIdMatch = pathname.match(/^\/api\/clientes\/([a-zA-Z0-9_-]+)$/);
    if (clienteIdMatch) {
      const id = clienteIdMatch[1];
      if (method === 'GET') {
        const cliente = db.getClienteById(id);
        if (!cliente) return sendJson(res, 404, { error: 'Cliente não encontrado' });
        sendJson(res, 200, cliente);
        return true;
      }
      if (method === 'DELETE') {
        db.deleteCliente(id);
        sendJson(res, 200, { success: true });
        return true;
      }
    }

    // --- MATERIAIS ---
    if (pathname === '/api/materiais') {
      if (method === 'GET') {
        sendJson(res, 200, db.getMateriais());
        return true;
      }
      if (method === 'POST') {
        const body = await readJsonBody(req);
        const saved = db.saveMaterial(body);
        sendJson(res, 201, saved);
        return true;
      }
    }

    const materialIdMatch = pathname.match(/^\/api\/materiais\/([a-zA-Z0-9_-]+)$/);
    if (materialIdMatch) {
      const id = materialIdMatch[1];
      if (method === 'GET') {
        const material = db.getMaterialById(id);
        if (!material) return sendJson(res, 404, { error: 'Material não encontrado' });
        sendJson(res, 200, material);
        return true;
      }
      if (method === 'DELETE') {
        db.deleteMaterial(id);
        sendJson(res, 200, { success: true });
        return true;
      }
    }

    // --- INSUMOS ---
    if (pathname === '/api/insumos') {
      if (method === 'GET') {
        sendJson(res, 200, db.getInsumos());
        return true;
      }
      if (method === 'POST') {
        const body = await readJsonBody(req);
        const saved = db.saveInsumo(body);
        sendJson(res, 201, saved);
        return true;
      }
    }

    // --- ORÇAMENTOS ---
    if (pathname === '/api/orcamentos') {
      if (method === 'GET') {
        sendJson(res, 200, db.getOrcamentos());
        return true;
      }
      if (method === 'POST') {
        try {
          const body = await readJsonBody(req);
          const saved = db.saveOrcamento(body);
          sendJson(res, 201, saved);
        } catch (err) {
          console.error('[API Error] Falha ao salvar orçamento:', err);
          sendJson(res, 500, { error: err.message || 'Falha interna ao salvar orçamento' });
        }
        return true;
      }
    }

    if (pathname === '/api/orcamentos/proximo-numero' && method === 'GET') {
      sendJson(res, 200, { proximoNumero: db.getProximoNumeroSequencial() });
      return true;
    }

    const orcamentoIdMatch = pathname.match(/^\/api\/orcamentos\/([a-zA-Z0-9_-]+)$/);
    if (orcamentoIdMatch) {
      const id = orcamentoIdMatch[1];
      if (method === 'GET') {
        const orcamento = db.getOrcamentoById(id);
        if (!orcamento) return sendJson(res, 404, { error: 'Orçamento não encontrado' });
        sendJson(res, 200, orcamento);
        return true;
      }
      if (method === 'DELETE') {
        db.deleteOrcamento(id);
        sendJson(res, 200, { success: true });
        return true;
      }
    }

    // Rota não encontrada na API
    sendJson(res, 404, { error: 'Endpoint da API não encontrado' });
    return true;
  } catch (err) {
    console.error('Erro na rota API:', err);
    sendJson(res, 500, { error: err.message || 'Erro interno no servidor' });
    return true;
  }
}
