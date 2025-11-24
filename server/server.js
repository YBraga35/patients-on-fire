/**
 * server.js
 *
 * Ponto de entrada principal do servidor PatientsOnFIRE.
 *
 * OBJETIVO:
 * Inicializar o servidor HTTP Node.js, configurar listeners e delegar
 * o processamento de requisições para o módulo router.
 *
 * FLUXO DE INICIALIZAÇÃO:
 * 1. Carregar configurações (config.js)
 * 2. Inicializar repositório de dados (carregar do arquivo se persistência habilitada)
 * 3. Criar servidor HTTP usando módulo nativo 'http'
 * 4. Configurar listener para requisições (delegar ao router)
 * 5. Iniciar servidor na porta e host configurados
 * 6. Exibir mensagem de confirmação no console
 *
 * MÓDULOS UTILIZADOS:
 * - http (nativo): criação do servidor HTTP
 * - config: configurações centralizadas
 * - router: roteamento de requisições
 * - patientRepository: inicialização de dados
 *
 * RESULTADO ESPERADO:
 * Servidor HTTP rodando em http://127.0.0.1:8080 (ou conforme config.js),
 * pronto para receber e processar requisições REST do cliente CRUDPatients.
 */

const http = require('http');
const config = require('./config');
const router = require('./router');
const patientRepository = require('./repository/patientRepository');

/**
 * Inicializa o servidor e todos os componentes necessários.
 */
async function startServer() {
  try {
    console.log('=== PatientsOnFIRE Server ===');
    console.log('Initializing...\n');

    // Inicializar repositório
    console.log('[Server] Initializing repository...');
    await patientRepository.initialize();

    // Criar servidor HTTP
    server = http.createServer(requestHandler);

    // Configurar handler de erro do servidor
    server.on('error', errorHandler);

    // Iniciar servidor
    server.listen(config.PORT, config.HOST, () => {
      console.log('\n=== Server Started Successfully ===');
      console.log(`API and CRUDPatients client running at http://${config.HOST}:${config.PORT}/`);
      console.log(`Base path for API: "${config.BASE_PATH || '/'}"`);
      console.log(`Persistence: ${config.ENABLE_PERSISTENCE ? 'Enabled' : 'Disabled'}`);
      console.log('\nAPI endpoints:');
      console.log('  POST   /Patient        - Create new patient');
      console.log('  GET    /Patient/<ID>   - Read patient by ID');
      console.log('  PUT    /Patient/<ID>   - Update patient');
      console.log('  DELETE /Patient/<ID>   - Delete patient');
      console.log('  GET    /PatientIDs     - List all patient IDs');
      console.log('\nPress Ctrl+C to stop the server\n');
    });

  } catch (error) {
    console.error('[Server] Failed to start:', error);
    errorHandler(error);
  }
}

// Variable to hold server instance
let server = null;

/**
 * Handler para todas as requisições HTTP recebidas.
 *
 * @param {http.IncomingMessage} req - Requisição HTTP
 * @param {http.ServerResponse} res - Resposta HTTP
 */
async function requestHandler(req, res) {
  // Logar requisição para debug
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  try {
    // Delegar para o router
    await router.route(req, res);
  } catch (error) {
    // Tratar erros não capturados
    console.error('[Server] Unhandled error in request handler:', error);

    // Verificar se resposta já foi enviada
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}

/**
 * Handler para eventos de erro do servidor.
 *
 * @param {Error} error - Erro capturado
 */
function errorHandler(error) {
  console.error('[Server] Error occurred:', error);

  // Tratar erros específicos
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${config.PORT} is already in use.`);
    console.error('[Server] Please close the other application or change the PORT in config.js');
  } else if (error.code === 'EACCES') {
    console.error(`[Server] Permission denied to bind to port ${config.PORT}`);
  } else {
    console.error('[Server] Unexpected error:', error.message);
  }

  process.exit(1);
}

/**
 * Handler para encerramento gracioso do servidor.
 */
function shutdownHandler() {
  console.log('\n[Server] Shutting down gracefully...');

  // Fechar servidor HTTP se existir
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });

    // Forçar encerramento após timeout
    setTimeout(() => {
      console.error('[Server] Forcing shutdown...');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
}

// Configurar handlers de sinais para encerramento gracioso
process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);

// Iniciar servidor
startServer().catch(errorHandler);
