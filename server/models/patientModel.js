/**
 * patientModel.js
 *
 * Modelo de dados para o recurso FHIR Patient.
 *
 * OBJETIVO:
 * Fornecer funções auxiliares para trabalhar com recursos Patient no formato JSON,
 * garantindo que o campo 'identifier' seja gerenciado corretamente conforme as
 * restrições do trabalho (identificadores inteiros positivos).
 *
 * FUNÇÕES PRINCIPAIS:
 * - createPatientTemplate(): Cria estrutura base de um Patient FHIR
 * - normalizePatient(): Normaliza objeto Patient recebido
 * - setIdentifier(): Define/atualiza o campo identifier do Patient
 * - getIdentifier(): Obtém o valor do identifier de um Patient
 * - validateIdentifierConsistency(): Valida consistência entre identifier e ID da URL
 * - validateBasicStructure(): Valida estrutura mínima de um Patient
 *
 * RESULTADO ESPERADO:
 * Abstrair a manipulação do recurso Patient, garantindo que o identifier
 * seja sempre um inteiro positivo e que haja consistência entre o identifier
 * do recurso e o ID usado na URL.
 */

/**
 * Cria um template base para o recurso Patient conforme FHIR v5.0.0.
 *
 * @returns {Object} Objeto Patient com estrutura mínima FHIR
 */
function createPatientTemplate() {
  return {
    resourceType: "Patient"
  };
}

/**
 * Normaliza um objeto Patient recebido, garantindo estrutura esperada.
 *
 * @param {Object} patientData - Dados do paciente a serem normalizados
 * @returns {Object} Patient normalizado
 */
function normalizePatient(patientData) {
  // Verificar se é objeto
  if (!patientData || typeof patientData !== 'object') {
    return createPatientTemplate();
  }

  // Garantir resourceType correto
  const normalized = { ...patientData };
  normalized.resourceType = "Patient";

  return normalized;
}

/**
 * Define ou atualiza o campo identifier do Patient com um ID inteiro positivo.
 *
 * Esta é a função crítica que garante a conformidade com a especificação
 * do trabalho: identifier deve ser um inteiro positivo.
 *
 * @param {Object} patient - Objeto Patient
 * @param {number} id - Identificador inteiro positivo a ser atribuído
 * @returns {Object} Patient com identifier atualizado
 */
function setIdentifier(patient, id) {
  // Validar que id é número inteiro positivo
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    throw new Error('Identifier must be a positive integer');
  }

  // Atribuir id ao campo patient.identifier
  patient.identifier = numId;

  return patient;
}

/**
 * Obtém o valor do identifier de um Patient.
 *
 * @param {Object} patient - Objeto Patient
 * @returns {number|null} Valor do identifier ou null se não existir
 */
function getIdentifier(patient) {
  return patient && patient.identifier ? patient.identifier : null;
}

/**
 * Valida se o identifier do Patient corresponde ao ID fornecido.
 *
 * Esta validação é essencial para a operação Update (PUT), onde o
 * identifier do corpo da requisição deve corresponder ao ID na URL.
 *
 * @param {Object} patient - Objeto Patient
 * @param {number} id - ID esperado
 * @returns {boolean} true se consistente, false caso contrário
 */
function validateIdentifierConsistency(patient, id) {
  if (!patient || !patient.identifier) {
    return false;
  }

  // Converter id para número para comparação
  const numId = Number(id);
  return patient.identifier === numId;
}

/**
 * Valida estrutura básica mínima de um Patient.
 *
 * Não implementa validação completa do padrão FHIR, apenas verifica
 * requisitos mínimos do trabalho.
 *
 * @param {Object} patient - Objeto Patient a ser validado
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateBasicStructure(patient) {
  const errors = [];

  // Verificar se é objeto
  if (!patient || typeof patient !== 'object') {
    errors.push('Patient must be an object');
    return { valid: false, errors };
  }

  // Verificar resourceType
  if (patient.resourceType !== 'Patient') {
    errors.push('resourceType must be "Patient"');
  }

  // Validações básicas opcionais de tipos
  if (patient.active !== undefined && typeof patient.active !== 'boolean') {
    errors.push('active must be a boolean');
  }

  if (patient.gender !== undefined && typeof patient.gender !== 'string') {
    errors.push('gender must be a string');
  }

  if (patient.birthDate !== undefined && typeof patient.birthDate !== 'string') {
    errors.push('birthDate must be a string');
  }

  if (patient.name !== undefined && !Array.isArray(patient.name)) {
    errors.push('name must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Exportar funções
module.exports = {
  createPatientTemplate,
  normalizePatient,
  setIdentifier,
  getIdentifier,
  validateIdentifierConsistency,
  validateBasicStructure
};
