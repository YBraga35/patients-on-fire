/**
 * patientController.js
 *
 * Controlador para gerenciar requisições HTTP relacionadas ao recurso Patient.
 *
 * OBJETIVO:
 * Implementar a lógica de aplicação para todas as operações CRUD sobre pacientes,
 * fazendo a ponte entre as requisições HTTP recebidas e o repositório de dados.
 * Responsável por validações, tratamento de erros e envio de respostas HTTP
 * com códigos de status corretos.
 *
 * HANDLERS (Funções manipuladoras de requisições):
 *
 * 1. handleCreatePatient(req, res)
 *    - Operação: Create (POST /Patient)
 *    - Recebe: JSON do Patient sem identifier
 *    - Responde: 201 Created + Location header
 *    - Erros: 400 (JSON inválido), 422 (regra de negócio)
 *
 * 2. handleReadPatient(req, res, id)
 *    - Operação: Read (GET /Patient/<ID>)
 *    - Recebe: ID na URL
 *    - Responde: 200 OK + JSON do Patient
 *    - Erros: 404 (não encontrado)
 *
 * 3. handleUpdatePatient(req, res, id)
 *    - Operação: Update (PUT /Patient/<ID>)
 *    - Recebe: ID na URL + JSON do Patient com identifier
 *    - Valida: identifier do body deve ser igual ao ID da URL
 *    - Responde: 200 OK + JSON atualizado
 *    - Erros: 400 (inconsistência de ID), 404 (não encontrado)
 *
 * 4. handleDeletePatient(req, res, id)
 *    - Operação: Delete (DELETE /Patient/<ID>)
 *    - Recebe: ID na URL
 *    - Responde: 204 No Content
 *    - Erros: 404 (não encontrado)
 *
 * 5. handlePatientIDs(req, res)
 *    - Operação: PatientIDs (GET /PatientIDs)
 *    - Recebe: nada
 *    - Responde: 200 OK + array JSON [1, 5, 8] ou 204 No Content
 *
 * RESULTADO ESPERADO:
 * Todas as requisições relacionadas a Patient são processadas corretamente,
 * com validações apropriadas, códigos HTTP corretos e respostas padronizadas.
 */

const patientRepository = require('../repository/patientRepository');
const patientModel = require('../models/patientModel');
const httpUtils = require('../utils/httpUtils');
const jsonUtils = require('../utils/jsonUtils');

/**
 * Handler para criação de novo paciente.
 *
 * POST /Patient
 * Body: JSON do Patient (identifier será ignorado se presente)
 * Response: 201 Created + Location: /Patient/<ID>
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 */
async function handleCreatePatient(req, res) {
  try {
    // Ler corpo JSON
    const patientData = await jsonUtils.readJsonBody(req);

    // Validar estrutura básica
    const validation = patientModel.validateBasicStructure(patientData);
    if (!validation.valid) {
      httpUtils.sendError(res, 400, 'Invalid patient data: ' + validation.errors.join(', '));
      return;
    }

    // Criar paciente no repositório
    const createdPatient = await patientRepository.createPatient(patientData);

    // Obter ID do paciente criado
    const id = patientModel.getIdentifier(createdPatient);

    // Definir header Location
    httpUtils.setLocationHeader(res, `/Patient/${id}`);

    // Retornar 201 Created com paciente
    httpUtils.sendJson(res, 201, createdPatient);

  } catch (error) {
    // Erros de parsing JSON
    if (error.message.includes('JSON')) {
      httpUtils.sendError(res, 400, error.message);
    } else {
      // Erros internos
      httpUtils.sendError(res, 500, 'Internal server error: ' + error.message);
    }
  }
}

/**
 * Handler para leitura de paciente por ID.
 *
 * GET /Patient/<ID>
 * Response: 200 OK + JSON do Patient
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 * @param {number} id - ID do paciente extraído da URL
 */
function handleReadPatient(req, res, id) {
  try {
    // Validar que id é número inteiro positivo
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      httpUtils.sendError(res, 400, 'Invalid patient ID');
      return;
    }

    // Buscar paciente
    const patient = patientRepository.getPatientById(numId);

    if (patient) {
      // Encontrado: retornar 200 OK
      httpUtils.sendJson(res, 200, patient);
    } else {
      // Não encontrado: retornar 404
      httpUtils.sendError(res, 404, 'Patient not found');
    }

  } catch (error) {
    httpUtils.sendError(res, 500, 'Internal server error: ' + error.message);
  }
}

/**
 * Handler para atualização de paciente existente.
 *
 * PUT /Patient/<ID>
 * Body: JSON do Patient com identifier === <ID>
 * Response: 200 OK + JSON atualizado
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 * @param {number} id - ID do paciente extraído da URL
 */
async function handleUpdatePatient(req, res, id) {
  try {
    // Validar que id é número inteiro positivo
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      httpUtils.sendError(res, 400, 'Invalid patient ID');
      return;
    }

    // Ler corpo JSON
    const patientData = await jsonUtils.readJsonBody(req);

    // Validar estrutura básica
    const validation = patientModel.validateBasicStructure(patientData);
    if (!validation.valid) {
      httpUtils.sendError(res, 400, 'Invalid patient data: ' + validation.errors.join(', '));
      return;
    }

    // Validar consistência do identifier
    if (!patientModel.validateIdentifierConsistency(patientData, numId)) {
      httpUtils.sendError(res, 400, 'Identifier mismatch: URL ID does not match patient identifier');
      return;
    }

    // Atualizar paciente
    const updatedPatient = await patientRepository.updatePatient(numId, patientData);

    if (updatedPatient) {
      // Atualizado com sucesso: retornar 200 OK
      httpUtils.sendJson(res, 200, updatedPatient);
    } else {
      // Não encontrado: retornar 404
      httpUtils.sendError(res, 404, 'Patient not found');
    }

  } catch (error) {
    // Erros de parsing JSON
    if (error.message.includes('JSON')) {
      httpUtils.sendError(res, 400, error.message);
    } else {
      httpUtils.sendError(res, 500, 'Internal server error: ' + error.message);
    }
  }
}

/**
 * Handler para exclusão de paciente.
 *
 * DELETE /Patient/<ID>
 * Response: 204 No Content (ou 404 se não encontrado)
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 * @param {number} id - ID do paciente extraído da URL
 */
async function handleDeletePatient(req, res, id) {
  try {
    // Validar que id é número inteiro positivo
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      httpUtils.sendError(res, 400, 'Invalid patient ID');
      return;
    }

    // Deletar paciente
    const deletedPatient = await patientRepository.deletePatient(numId);

    if (deletedPatient) {
      // Removido com sucesso: retornar 204 No Content
      httpUtils.sendNoContent(res, 204);
    } else {
      // Não encontrado: retornar 404
      httpUtils.sendError(res, 404, 'Patient not found');
    }

  } catch (error) {
    httpUtils.sendError(res, 500, 'Internal server error: ' + error.message);
  }
}

/**
 * Handler para listagem de IDs de pacientes.
 *
 * GET /PatientIDs
 * Response: 200 OK + JSON array [1, 5, 8] ou 204 No Content
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 */
function handlePatientIDs(req, res) {
  try {
    // Obter todos os IDs
    const ids = patientRepository.getAllIds();

    if (ids.length === 0) {
      // Nenhum paciente: retornar 204 No Content
      httpUtils.sendNoContent(res, 204);
    } else {
      // Retornar array de IDs: 200 OK
      httpUtils.sendJson(res, 200, ids);
    }

  } catch (error) {
    httpUtils.sendError(res, 500, 'Internal server error: ' + error.message);
  }
}

// Exportar handlers
module.exports = {
  handleCreatePatient,
  handleReadPatient,
  handleUpdatePatient,
  handleDeletePatient,
  handlePatientIDs
};
