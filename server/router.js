/**
 * router.js
 *
 * Roteador HTTP manual para o servidor PatientsOnFIRE.
 *
 * OBJETIVO:
 * Implementar roteamento de requisições HTTP sem uso de frameworks externos.
 * Analisa método HTTP e URL para direcionar cada requisição ao handler apropriado
 * no patientController.
 *
 * ROTAS SUPORTADAS:
 *
 * 1. POST /Patient           → patientController.handleCreatePatient
 * 2. GET /Patient/<ID>       → patientController.handleReadPatient
 * 3. PUT /Patient/<ID>       → patientController.handleUpdatePatient
 * 4. DELETE /Patient/<ID>    → patientController.handleDeletePatient
 * 5. GET /PatientIDs         → patientController.handlePatientIDs
 *
 * TRATAMENTO DE ERROS:
 * - 404 Not Found: rota não existe
 * - 405 Method Not Allowed: rota existe mas método HTTP não é suportado
 * - 500 Internal Server Error: exceções não tratadas
 *
 * RESULTADO ESPERADO:
 * Cada requisição recebida é analisada e direcionada ao handler correto,
 * ou retorna erro apropriado se a rota/método não for válido.
 */

const url = require('url');
const fs = require('fs');
const path = require('path');
const patientController = require('./controllers/patientController');
const httpUtils = require('./utils/httpUtils');
const config = require('./config');

// Mapeamento simples de tipos MIME para evitar dependências externas
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

/**
 * Processa uma requisição HTTP e a direciona ao handler apropriado.
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 */
async function route(req, res) {
  try {
    const parsedUrl = httpUtils.parseUrl(req);
    let pathname = normalizePath(parsedUrl.pathname);
    const method = req.method;

    // Se for GET e não for uma rota de API, tentar servir como arquivo estático
    if (method === 'GET' && !pathname.startsWith('/Patient')) {
      return handleStaticFile(req, res, pathname);
    }
    
    // Rota: POST /Patient - Criar paciente
    if (method === 'POST' && pathname === '/Patient') {
      return await patientController.handleCreatePatient(req, res);
    }

    // Rota: GET /PatientIDs - Listar IDs
    if (method === 'GET' && pathname === '/PatientIDs') {
      return patientController.handlePatientIDs(req, res);
    }

    // Rota: GET /Patient/<ID> - Ler paciente
    if (method === 'GET' && pathname.startsWith('/Patient/')) {
      const id = extractId(pathname, '/Patient/');
      if (id) {
        return patientController.handleReadPatient(req, res, id);
      } else {
        httpUtils.sendError(res, 400, 'Invalid patient ID in URL');
        return;
      }
    }

    // Rota: PUT /Patient/<ID> - Atualizar paciente
    if (method === 'PUT' && pathname.startsWith('/Patient/')) {
      const id = extractId(pathname, '/Patient/');
      if (id) {
        return await patientController.handleUpdatePatient(req, res, id);
      } else {
        httpUtils.sendError(res, 400, 'Invalid patient ID in URL');
        return;
      }
    }

    // Rota: DELETE /Patient/<ID> - Deletar paciente
    if (method === 'DELETE' && pathname.startsWith('/Patient/')) {
      const id = extractId(pathname, '/Patient/');
      if (id) {
        return await patientController.handleDeletePatient(req, res, id);
      } else {
        httpUtils.sendError(res, 400, 'Invalid patient ID in URL');
        return;
      }
    }

    // Se chegou aqui, rota não encontrada
    httpUtils.sendError(res, 404, `Route not found: ${method} ${pathname}`);

  } catch (error) {
    console.error('[Router] Unhandled error:', error);
    httpUtils.sendError(res, 500, 'Internal server error');
  }
}

/**
 * Manipula requisições para arquivos estáticos.
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 * @param {string} pathname - Caminho da URL
 */
function handleStaticFile(req, res, pathname) {
  // Rota raiz deve servir o index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Construir caminho seguro para o arquivo
  const clientDir = path.join(__dirname, '..', 'client');
  const filePath = path.join(clientDir, pathname);

  // Validar para evitar saida do diretório client
  if (!filePath.startsWith(clientDir)) {
    httpUtils.sendError(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Ignorar favicon.ico se não encontrado
        if (pathname === '/favicon.ico') {
          httpUtils.sendNoContent(res, 204);
        } else {
          httpUtils.sendError(res, 404, `File not found: ${pathname}`);
        }
      } else {
        httpUtils.sendError(res, 500, `Error reading file: ${err.code}`);
      }
      return;
    }

    // Obter tipo MIME pela extensão
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Enviar resposta
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Extrai ID numérico de um pathname.
 *
 * Exemplo: "/Patient/123" → 123
 *
 * @param {string} pathname - Caminho da URL
 * @param {string} prefix - Prefixo esperado (ex: "/Patient/")
 * @returns {number|null} ID extraído ou null se inválido
 */
function extractId(pathname, prefix) {
  // Verificar se pathname começa com prefix
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  // Extrair parte após o prefix
  const idPart = pathname.substring(prefix.length);

  // Validar que é número inteiro positivo
  const id = Number(idPart);
  if (Number.isInteger(id) && id > 0) {
    return id;
  }

  return null;
}

/**
 * Normaliza pathname removendo trailing slashes e considerando BASE_PATH.
 *
 * @param {string} pathname - Pathname original
 * @returns {string} Pathname normalizado
 */
function normalizePath(pathname) {
  let normalized = pathname;

  // Remover trailing slashes (exceto root /)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // Remover BASE_PATH se configurado
  if (config.BASE_PATH && normalized.startsWith(config.BASE_PATH)) {
    normalized = normalized.substring(config.BASE_PATH.length);
  }

  // Garantir que sempre começa com /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  return normalized;
}

// Exportar função de roteamento
module.exports = {
  route
};
