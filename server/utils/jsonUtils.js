/**
 * jsonUtils.js
 *
 * Utilitários para manipulação de dados JSON.
 *
 * OBJETIVO:
 * Fornecer funções para leitura e parsing do corpo JSON das requisições HTTP,
 * além de persistência opcional em arquivo JSON.
 *
 * FUNÇÕES PRINCIPAIS:
 * - readJsonBody(): Lê e faz parsing do corpo JSON de uma requisição HTTP
 * - loadFromFile(): Carrega dados de um arquivo JSON (persistência)
 * - saveToFile(): Salva dados em um arquivo JSON (persistência)
 *
 * RESULTADO ESPERADO:
 * Abstrair a complexidade de trabalhar com streams HTTP e operações de I/O,
 * retornando Promises que resolvem com dados JavaScript ou rejeitam com erros.
 */

const fs = require('fs');

/**
 * Lê e faz parsing do corpo JSON de uma requisição HTTP.
 *
 * Como o corpo da requisição chega em chunks (stream), é necessário
 * acumular todos os dados antes de fazer o parsing JSON.
 *
 * @param {http.IncomingMessage} req - Objeto de requisição HTTP
 * @returns {Promise<Object>} Promise que resolve com objeto JavaScript parseado
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        if (body.length === 0) {
          reject(new Error('Request body is empty'));
          return;
        }
        const data = JSON.parse(body);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON: ' + error.message));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Carrega dados de um arquivo JSON.
 *
 * @param {string} filePath - Caminho do arquivo JSON
 * @returns {Promise<Object>} Promise que resolve com dados parseados do arquivo
 */
function loadFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // Se arquivo não existe, retornar dados padrão
        if (err.code === 'ENOENT') {
          resolve({ patients: {}, nextId: 1 });
        } else {
          reject(err);
        }
      } else {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

/**
 * Salva dados em um arquivo JSON.
 *
 * @param {string} filePath - Caminho do arquivo JSON
 * @param {Object} data - Dados a serem salvos
 * @returns {Promise<void>} Promise que resolve quando salvamento completar
 */
function saveToFile(filePath, data) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data, null, 2);
    fs.writeFile(filePath, json, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Exportar funções
module.exports = {
  readJsonBody,
  loadFromFile,
  saveToFile
};
