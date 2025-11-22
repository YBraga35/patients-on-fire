/**
 * config.js
 *
 * Arquivo de configuração central do servidor PatientsOnFIRE.
 *
 * OBJETIVO:
 * Centralizar todas as constantes de configuração do servidor em um único local,
 * facilitando manutenção e permitindo futura parametrização via variáveis de ambiente.
 *
 * CONFIGURAÇÕES DISPONÍVEIS:
 * - HOST: Endereço IP do servidor (padrão: localhost)
 * - PORT: Porta HTTP do servidor (padrão: 8080)
 * - BASE_PATH: Caminho base para as rotas da API (vazio = rotas diretas como /Patient)
 * - ENABLE_PERSISTENCE: Flag para habilitar persistência em arquivo JSON
 * - DATA_FILE: Nome do arquivo JSON para persistência de dados
 *
 * RESULTADO ESPERADO:
 * Exportar objeto com todas as configurações necessárias para inicialização
 * e operação do servidor, permitindo fácil customização sem alterar código.
 */

// Configurações de rede
const HOST = '127.0.0.1';  // Servidor local
const PORT = 8080;          // Porta HTTP padrão para o servidor

// Configurações de roteamento
const BASE_PATH = '';       // Caminho base vazio = rotas como /Patient, /PatientIDs

// Configurações de persistência
const ENABLE_PERSISTENCE = false;           // false = armazenamento em memória
const DATA_FILE = 'patients-data.json';     // Arquivo para persistência quando habilitada

// Exportar todas as configurações
module.exports = {
  HOST,
  PORT,
  BASE_PATH,
  ENABLE_PERSISTENCE,
  DATA_FILE
};
