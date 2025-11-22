/**
 * httpUtils.js
 *
 * Utilitários para manipulação de requisições e respostas HTTP.
 *
 * OBJETIVO:
 * Centralizar a lógica de envio de respostas HTTP, garantindo consistência
 * no formato das respostas, cabeçalhos corretos e códigos de status adequados.
 *
 * FUNÇÕES PRINCIPAIS:
 * - sendJson(): Envia resposta JSON com código de status e cabeçalhos corretos
 * - sendError(): Envia resposta de erro padronizada em JSON
 * - sendNoContent(): Envia resposta sem corpo (204, 202, etc.)
 * - parseUrl(): Faz parsing da URL da requisição
 * - setLocationHeader(): Define o cabeçalho Location para recursos criados
 *
 * RESULTADO ESPERADO:
 * Fornecer interface consistente para envio de respostas HTTP, abstraindo
 * detalhes como definição de headers, serialização JSON e encoding UTF-8.
 */

const url = require('url');

/**
 * Envia uma resposta JSON com código de status e dados fornecidos.
 *
 * @param {http.ServerResponse} res - Objeto de resposta HTTP
 * @param {number} statusCode - Código de status HTTP (200, 201, etc.)
 * @param {Object} data - Objeto JavaScript a ser serializado como JSON
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

/**
 * Envia uma resposta de erro padronizada em JSON.
 *
 * @param {http.ServerResponse} res - Objeto de resposta HTTP
 * @param {number} statusCode - Código de status HTTP (400, 404, 500, etc.)
 * @param {string} message - Mensagem descritiva do erro
 */
function sendError(res, statusCode, message) {
  const errorObj = { error: message };
  sendJson(res, statusCode, errorObj);
}

/**
 * Envia uma resposta sem corpo (No Content).
 *
 * @param {http.ServerResponse} res - Objeto de resposta HTTP
 * @param {number} statusCode - Código de status HTTP (204, 202, etc.)
 */
function sendNoContent(res, statusCode) {
  res.writeHead(statusCode);
  res.end();
}

/**
 * Faz parsing da URL da requisição, extraindo pathname e query parameters.
 *
 * @param {http.IncomingMessage} req - Objeto de requisição HTTP
 * @returns {Object} Objeto com pathname e query extraídos
 */
function parseUrl(req) {
  return url.parse(req.url, true);
}

/**
 * Define o cabeçalho Location na resposta (usado em operações Create - 201).
 *
 * @param {http.ServerResponse} res - Objeto de resposta HTTP
 * @param {string} resourceUrl - URL do recurso criado (ex: /Patient/5)
 */
function setLocationHeader(res, resourceUrl) {
  res.setHeader('Location', resourceUrl);
}

// Exportar funções
module.exports = {
  sendJson,
  sendError,
  sendNoContent,
  parseUrl,
  setLocationHeader
};
