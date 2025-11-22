/**
 * api.js
 *
 * Módulo de comunicação com a API REST do servidor PatientsOnFIRE.
 *
 * OBJETIVO:
 * Centralizar todas as chamadas HTTP ao servidor, abstraindo detalhes de
 * requisições fetch, headers, serialização JSON e tratamento de respostas.
 *
 * CONFIGURAÇÃO:
 * - API_BASE_URL: URL base do servidor (deve corresponder a config.js do servidor)
 *
 * FUNÇÕES DE API (uma para cada operação):
 *
 * 1. createPatient(patientObj)
 *    - Método: POST /Patient
 *    - Envia: JSON do paciente (sem identifier)
 *    - Retorna: Paciente criado com identifier + header Location
 *
 * 2. readPatient(id)
 *    - Método: GET /Patient/<ID>
 *    - Envia: ID na URL
 *    - Retorna: JSON do paciente
 *
 * 3. updatePatient(id, patientObj)
 *    - Método: PUT /Patient/<ID>
 *    - Envia: JSON do paciente (com identifier === id)
 *    - Retorna: Paciente atualizado
 *
 * 4. deletePatient(id)
 *    - Método: DELETE /Patient/<ID>
 *    - Envia: ID na URL
 *    - Retorna: Status de confirmação
 *
 * 5. getPatientIDs()
 *    - Método: GET /PatientIDs
 *    - Envia: nada
 *    - Retorna: Array de IDs [1, 5, 8, ...]
 *
 * TRATAMENTO DE RESPOSTAS:
 * Todas as funções retornam Promises que:
 * - Resolvem com dados em caso de sucesso (status 200, 201, 204)
 * - Rejeitam com objeto de erro em caso de falha (400, 404, 500, etc.)
 *
 * RESULTADO ESPERADO:
 * Interface JavaScript limpa e consistente para que ui.js possa consumir
 * a API sem se preocupar com detalhes de HTTP/fetch.
 */

// Configuração da URL base da API
// IMPORTANTE: Deve corresponder ao HOST:PORT configurado em server/config.js
const API_BASE_URL = 'http://127.0.0.1:8080';

/**
 * Cria um novo paciente no servidor.
 *
 * @param {Object} patientObj - Objeto com dados do paciente (sem identifier)
 * @returns {Promise<Object>} Promise que resolve com paciente criado
 */
async function createPatient(patientObj) {
  const response = await fetch(`${API_BASE_URL}/Patient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientObj)
  });

  const data = await handleResponse(response);

  // Extrair Location header se disponível
  const location = response.headers.get('Location');
  if (location) {
    console.log('Patient created at:', location);
  }

  return data;
}

/**
 * Busca um paciente por ID.
 *
 * @param {number} id - ID do paciente
 * @returns {Promise<Object>} Promise que resolve com dados do paciente
 */
async function readPatient(id) {
  const response = await fetch(`${API_BASE_URL}/Patient/${id}`, {
    method: 'GET'
  });

  return await handleResponse(response);
}

/**
 * Atualiza um paciente existente.
 *
 * @param {number} id - ID do paciente
 * @param {Object} patientObj - Objeto com dados atualizados (deve conter identifier)
 * @returns {Promise<Object>} Promise que resolve com paciente atualizado
 */
async function updatePatient(id, patientObj) {
  // Garantir que identifier está correto
  patientObj.identifier = Number(id);

  const response = await fetch(`${API_BASE_URL}/Patient/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientObj)
  });

  return await handleResponse(response);
}

/**
 * Exclui um paciente.
 *
 * @param {number} id - ID do paciente
 * @returns {Promise<void>} Promise que resolve quando exclusão completar
 */
async function deletePatient(id) {
  const response = await fetch(`${API_BASE_URL}/Patient/${id}`, {
    method: 'DELETE'
  });

  return await handleResponse(response);
}

/**
 * Obtém lista de todos os IDs de pacientes.
 *
 * @returns {Promise<number[]>} Promise que resolve com array de IDs
 */
async function getPatientIDs() {
  const response = await fetch(`${API_BASE_URL}/PatientIDs`, {
    method: 'GET'
  });

  const data = await handleResponse(response);

  // Se 204 No Content, retornar array vazio
  if (data === null) {
    return [];
  }

  return data;
}

/**
 * Função auxiliar para processar resposta fetch e extrair JSON ou erro.
 *
 * @param {Response} response - Objeto Response do fetch
 * @returns {Promise<Object>} Promise com dados JSON ou erro
 */
async function handleResponse(response) {
  // Status 204 No Content não tem corpo
  if (response.status === 204) {
    return null;
  }

  // Tentar extrair JSON da resposta
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  // Verificar se resposta foi bem-sucedida
  if (response.ok) {
    return data;
  }

  // Erro: extrair mensagem
  const errorMessage = data && data.error ? data.error : `HTTP Error ${response.status}`;
  const error = new Error(errorMessage);
  error.status = response.status;
  throw error;
}

// Exportar funções (se usando módulos ES6) ou deixar no escopo global
// Para HTML simples, as funções ficarão disponíveis globalmente
