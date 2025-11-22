/**
 * patientRepository.js
 *
 * Repositório de dados para recursos Patient.
 *
 * OBJETIVO:
 * Gerenciar o armazenamento e recuperação de recursos Patient, seja em memória
 * ou com persistência opcional em arquivo JSON. Responsável pela geração de
 * identificadores únicos inteiros positivos.
 *
 * ESTRUTURA DE DADOS:
 * - patients: Objeto/Map com estrutura { id: patientObject }
 * - nextId: Contador para geração de novos IDs
 *
 * FUNÇÕES PRINCIPAIS:
 * - createPatient(): Cria novo paciente, gera ID e armazena
 * - getPatientById(): Recupera paciente por ID
 * - updatePatient(): Atualiza paciente existente
 * - deletePatient(): Remove paciente do repositório
 * - getAllIds(): Retorna array com todos os IDs existentes
 * - patientExists(): Verifica se paciente existe
 * - getPatientCount(): Retorna quantidade de pacientes armazenados
 *
 * PERSISTÊNCIA:
 * - loadData(): Carrega dados do arquivo (se persistência habilitada)
 * - saveData(): Salva dados no arquivo (se persistência habilitada)
 *
 * RESULTADO ESPERADO:
 * Fornecer interface de acesso a dados completamente desacoplada da camada
 * de controle, permitindo facilmente trocar o mecanismo de armazenamento
 * (memória, arquivo, banco de dados futuro) sem afetar o resto da aplicação.
 */

const patientModel = require('../models/patientModel');
const jsonUtils = require('../utils/jsonUtils');
const config = require('../config');

// Estrutura de armazenamento em memória
// Formato: { 1: {Patient}, 5: {Patient}, 8: {Patient}, ... }
let patients = {};

// Contador para geração de IDs únicos (auto-incremento)
let nextId = 1;

/**
 * Inicializa o repositório, carregando dados do arquivo se persistência estiver habilitada.
 *
 * @returns {Promise<void>}
 */
async function initialize() {
  if (config.ENABLE_PERSISTENCE) {
    await loadData();
    console.log('[Repository] Dados carregados do arquivo');
  } else {
    console.log('[Repository] Modo em memória (sem persistência)');
  }
}

/**
 * Carrega dados do arquivo JSON (se existir).
 *
 * @returns {Promise<void>}
 */
async function loadData() {
  try {
    const data = await jsonUtils.loadFromFile(config.DATA_FILE);
    patients = data.patients || {};
    nextId = data.nextId || 1;
  } catch (error) {
    console.error('[Repository] Erro ao carregar dados:', error.message);
    // Manter valores padrão em caso de erro
    patients = {};
    nextId = 1;
  }
}

/**
 * Salva dados no arquivo JSON.
 *
 * @returns {Promise<void>}
 */
async function saveData() {
  if (config.ENABLE_PERSISTENCE) {
    try {
      await jsonUtils.saveToFile(config.DATA_FILE, { patients, nextId });
    } catch (error) {
      console.error('[Repository] Erro ao salvar dados:', error.message);
    }
  }
}

/**
 * Cria um novo paciente no repositório.
 *
 * Gera automaticamente um novo ID inteiro positivo, atribui ao campo
 * identifier do paciente e armazena no repositório.
 *
 * @param {Object} patientData - Dados do paciente (sem identifier)
 * @returns {Object} Paciente criado com identifier atribuído
 */
async function createPatient(patientData) {
  // Gerar novo ID
  const id = nextId;
  nextId++;

  // Normalizar e atribuir identifier ao paciente
  const normalized = patientModel.normalizePatient(patientData);
  const patient = patientModel.setIdentifier(normalized, id);

  // Armazenar no repositório
  patients[id] = patient;

  // Salvar se persistência habilitada
  await saveData();

  return patient;
}

/**
 * Recupera um paciente por seu ID.
 *
 * @param {number} id - ID do paciente
 * @returns {Object|null} Objeto Patient ou null se não encontrado
 */
function getPatientById(id) {
  const numId = Number(id);
  return patients[numId] || null;
}

/**
 * Atualiza um paciente existente.
 *
 * Substitui completamente o recurso armazenado pelo novo fornecido.
 *
 * @param {number} id - ID do paciente a atualizar
 * @param {Object} patientData - Novos dados do paciente
 * @returns {Object|null} Paciente atualizado ou null se não encontrado
 */
async function updatePatient(id, patientData) {
  const numId = Number(id);

  // Verificar se paciente existe
  if (!patients[numId]) {
    return null;
  }

  // Garantir que identifier está correto
  const normalized = patientModel.normalizePatient(patientData);
  const patient = patientModel.setIdentifier(normalized, numId);

  // Substituir no repositório
  patients[numId] = patient;

  // Salvar se persistência habilitada
  await saveData();

  return patient;
}

/**
 * Remove um paciente do repositório.
 *
 * @param {number} id - ID do paciente a remover
 * @returns {Object|null} Paciente removido ou null se não existir
 */
async function deletePatient(id) {
  const numId = Number(id);

  // Verificar se paciente existe
  if (!patients[numId]) {
    return null;
  }

  // Guardar referência ao paciente antes de remover
  const deletedPatient = patients[numId];

  // Remover do repositório
  delete patients[numId];

  // Salvar se persistência habilitada
  await saveData();

  return deletedPatient;
}

/**
 * Retorna array com todos os IDs de pacientes armazenados.
 *
 * @returns {number[]} Array de IDs inteiros positivos
 */
function getAllIds() {
  return Object.keys(patients)
    .map(id => Number(id))
    .sort((a, b) => a - b);
}

/**
 * Verifica se um paciente existe no repositório.
 *
 * @param {number} id - ID do paciente
 * @returns {boolean} true se existe, false caso contrário
 */
function patientExists(id) {
  const numId = Number(id);
  return patients[numId] !== undefined;
}

/**
 * Retorna a quantidade de pacientes armazenados.
 *
 * @returns {number} Quantidade de pacientes
 */
function getPatientCount() {
  return Object.keys(patients).length;
}

// Exportar funções
module.exports = {
  initialize,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  getAllIds,
  patientExists,
  getPatientCount
};
