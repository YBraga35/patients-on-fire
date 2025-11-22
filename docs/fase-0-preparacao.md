# Fase 0: Preparação e Estruturação do Projeto PatientsOnFIRE

## Data: 2025-11-22

## Objetivo da Fase

Criar a estrutura completa de pastas e arquivos do projeto PatientsOnFIRE, preparando todos os módulos com:
- Documentação detalhada de cada arquivo
- Declaração de todas as funções e métodos esperados
- Comentários descritivos do que cada função deve fazer
- Estrutura pronta para implementação nas próximas fases

**Status:** ✅ CONCLUÍDA

---

## Estrutura de Pastas Criada

```
patients-on-fire/
├── server/
│   ├── config.js                       ✅ Criado
│   ├── server.js                       ✅ Criado
│   ├── router.js                       ✅ Criado
│   ├── controllers/
│   │   └── patientController.js        ✅ Criado
│   ├── repository/
│   │   └── patientRepository.js        ✅ Criado
│   ├── models/
│   │   └── patientModel.js             ✅ Criado
│   └── utils/
│       ├── httpUtils.js                ✅ Criado
│       └── jsonUtils.js                ✅ Criado
├── client/
│   ├── index.html                      ✅ Criado
│   ├── css/
│   │   └── styles.css                  ✅ Criado
│   └── js/
│       ├── api.js                      ✅ Criado
│       └── ui.js                       ✅ Criado
├── docs/
│   ├── guia_projeto_patients_on_fire.md
│   ├── guia_relatorio_patients_on_fire_fundamentos_de_redes_e_sd.md
│   ├── guia_tecnico_patients_on_fire_estrutura_e_implementacao.md
│   └── fase-0-preparacao.md            ✅ Criado (este arquivo)
└── CLAUDE.md                            ✅ Criado
```

---

## Arquivos Criados e Suas Responsabilidades

### 1. Servidor (Backend)

#### 1.1 Configuração (`server/config.js`)
**Status:** ✅ Estrutura pronta

**Responsabilidade:**
Centralizar todas as configurações do servidor em um único local.

**Constantes Definidas:**
- `HOST`: Endereço IP (127.0.0.1)
- `PORT`: Porta HTTP (8080)
- `BASE_PATH`: Caminho base das rotas (vazio)
- `ENABLE_PERSISTENCE`: Flag de persistência (false)
- `DATA_FILE`: Nome do arquivo JSON (patients-data.json)

**Próximos Passos:**
- Implementação completa ✅
- Suporte a variáveis de ambiente (futuro)

---

#### 1.2 Utilitários

##### `server/utils/httpUtils.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Funções Preparadas:**
1. `sendJson(res, statusCode, data)` - Envia resposta JSON
2. `sendError(res, statusCode, message)` - Envia erro padronizado
3. `sendNoContent(res, statusCode)` - Envia resposta sem corpo
4. `parseUrl(req)` - Faz parsing da URL
5. `setLocationHeader(res, resourceUrl)` - Define header Location

**Próximos Passos:**
- Implementar cada função seguindo os comentários TODO
- Garantir charset UTF-8 em todas as respostas JSON
- Tratar casos especiais (204, 201, etc.)

##### `server/utils/jsonUtils.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Funções Preparadas:**
1. `readJsonBody(req)` - Lê corpo JSON da requisição (Promise)
2. `loadFromFile(filePath)` - Carrega dados do arquivo (Promise)
3. `saveToFile(filePath, data)` - Salva dados no arquivo (Promise)

**Próximos Passos:**
- Implementar leitura de stream com acumulação de chunks
- Implementar parsing JSON com tratamento de erros
- Implementar I/O de arquivo com fs.readFile/writeFile

---

#### 1.3 Camada de Modelo

##### `server/models/patientModel.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Funções Preparadas:**
1. `createPatientTemplate()` - Cria template base Patient FHIR
2. `normalizePatient(patientData)` - Normaliza estrutura do paciente
3. `setIdentifier(patient, id)` - Define identifier (inteiro positivo)
4. `getIdentifier(patient)` - Obtém identifier do paciente
5. `validateIdentifierConsistency(patient, id)` - Valida consistência identifier/ID
6. `validateBasicStructure(patient)` - Valida estrutura mínima

**Próximos Passos:**
- Implementar setIdentifier garantindo tipo inteiro positivo
- Implementar validateIdentifierConsistency para operação UPDATE
- Implementar validações básicas (resourceType, etc.)

---

#### 1.4 Camada de Repositório

##### `server/repository/patientRepository.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Estrutura de Dados:**
- `patients = {}` - Objeto para armazenar pacientes (key = ID)
- `nextId = 1` - Contador para geração de IDs

**Funções Preparadas:**
1. `initialize()` - Inicializa repositório (carrega arquivo se necessário)
2. `loadData()` - Carrega dados do arquivo JSON
3. `saveData()` - Salva dados no arquivo JSON
4. `createPatient(patientData)` - Cria paciente e gera ID
5. `getPatientById(id)` - Recupera paciente por ID
6. `updatePatient(id, patientData)` - Atualiza paciente
7. `deletePatient(id)` - Remove paciente
8. `getAllIds()` - Retorna array de IDs
9. `patientExists(id)` - Verifica existência
10. `getPatientCount()` - Retorna quantidade de pacientes

**Próximos Passos:**
- Implementar geração de IDs (auto-incremento)
- Implementar CRUD completo
- Implementar persistência opcional em arquivo
- Garantir atomicidade nas operações

---

#### 1.5 Camada de Controller

##### `server/controllers/patientController.js`
**Status:** ✅ Handlers declarados, implementação pendente

**Handlers Preparados:**
1. `handleCreatePatient(req, res)` - POST /Patient → 201 Created
2. `handleReadPatient(req, res, id)` - GET /Patient/<ID> → 200 OK
3. `handleUpdatePatient(req, res, id)` - PUT /Patient/<ID> → 200 OK
4. `handleDeletePatient(req, res, id)` - DELETE /Patient/<ID> → 204 No Content
5. `handlePatientIDs(req, res)` - GET /PatientIDs → 200 OK + array

**Próximos Passos:**
- Implementar cada handler seguindo especificação REST
- Implementar validações de entrada
- Implementar tratamento de erros HTTP corretos
- Garantir respostas com códigos de status apropriados

---

#### 1.6 Roteamento

##### `server/router.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Função Principal:**
- `route(req, res)` - Processa requisição e roteia para handler

**Funções Auxiliares Preparadas:**
- `extractId(pathname, prefix)` - Extrai ID da URL
- `normalizePath(pathname)` - Normaliza pathname

**Rotas a Implementar:**
- POST /Patient → handleCreatePatient
- GET /Patient/<ID> → handleReadPatient
- PUT /Patient/<ID> → handleUpdatePatient
- DELETE /Patient/<ID> → handleDeletePatient
- GET /PatientIDs → handlePatientIDs

**Próximos Passos:**
- Implementar lógica de roteamento manual (sem frameworks)
- Implementar extração de IDs numéricos da URL
- Implementar retorno de 404/405 para rotas inválidas
- Implementar tratamento de exceções (500)

---

#### 1.7 Servidor Principal

##### `server/server.js`
**Status:** ✅ Estrutura preparada, implementação pendente

**Funções Preparadas:**
1. `startServer()` - Inicializa servidor HTTP
2. `requestHandler(req, res)` - Handler de requisições
3. `errorHandler(error)` - Handler de erros
4. `shutdownHandler()` - Encerramento gracioso

**Próximos Passos:**
- Implementar criação do servidor HTTP com http.createServer
- Implementar inicialização do repositório
- Implementar delegação ao router
- Implementar handlers de sinais (SIGINT, SIGTERM)
- Implementar logging de requisições

---

### 2. Cliente (Frontend)

#### 2.1 Comunicação com API

##### `client/js/api.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Constante:**
- `API_BASE_URL = 'http://127.0.0.1:8080'`

**Funções Preparadas:**
1. `createPatient(patientObj)` - POST /Patient
2. `readPatient(id)` - GET /Patient/<ID>
3. `updatePatient(id, patientObj)` - PUT /Patient/<ID>
4. `deletePatient(id)` - DELETE /Patient/<ID>
5. `getPatientIDs()` - GET /PatientIDs
6. `handleResponse(response)` - Processa respostas fetch

**Próximos Passos:**
- Implementar cada função usando Fetch API
- Implementar tratamento de respostas HTTP
- Implementar extração de erros do servidor
- Implementar retorno de Promises consistente

---

#### 2.2 Interface do Usuário

##### `client/js/ui.js`
**Status:** ✅ Funções declaradas, implementação pendente

**Funções Preparadas:**

**Inicialização:**
- `init()` - Registra event listeners

**Handlers de Eventos:**
- `onCreatePatient(event)` - Handler de criação
- `onReadPatient()` - Handler de leitura
- `onUpdatePatient(event)` - Handler de atualização
- `onDeletePatient()` - Handler de exclusão
- `onLoadPatientIDs()` - Handler de listagem

**Funções de Exibição:**
- `displayPatient(patient)` - Exibe dados do paciente
- `displayPatientList(ids)` - Exibe lista de IDs
- `displayMessage(message, type)` - Exibe mensagens
- `clearForms()` - Limpa formulários
- `populateEditForm(patient)` - Preenche form de edição

**Funções de Conversão:**
- `formToPatient(form)` - Form → Patient JSON
- `patientToForm(patient)` - Patient → valores de form

**Próximos Passos:**
- Implementar inicialização e event listeners
- Implementar handlers de cada operação CRUD
- Implementar funções de exibição e feedback visual
- Implementar conversão entre formulários e objetos JSON

---

#### 2.3 Interface HTML

##### `client/index.html`
**Status:** ✅ Estrutura criada, formulários pendentes

**Seções Criadas:**
1. Cabeçalho com título e descrição
2. Área de mensagens
3. Formulário de criação (TODO: implementar campos)
4. Área de busca por ID
5. Formulário de atualização (TODO: implementar campos)
6. Área de exclusão
7. Listagem de IDs
8. Rodapé

**Próximos Passos:**
- Implementar campos completos do formulário de criação
- Implementar campos completos do formulário de atualização
- Mapear campos HTML para estrutura FHIR Patient
- Adicionar validações HTML5 (required, pattern, etc.)

---

#### 2.4 Estilos CSS

##### `client/css/styles.css`
**Status:** ✅ Estilos básicos, expansão pendente

**Estilos Implementados:**
- Reset básico
- Variáveis CSS para cores
- Layout do container
- Estilos básicos de seções
- Estilos básicos de botões e inputs

**Próximos Passos:**
- Implementar estilos completos de formulários
- Implementar estilos de mensagens de sucesso/erro
- Implementar lista de IDs clicável
- Implementar responsividade para mobile
- Implementar estados de loading/disabled

---

## Resumo da Fase 0

### Arquivos Criados: 12
- **Servidor:** 8 arquivos (config, server, router, controller, repository, model, 2 utils)
- **Cliente:** 4 arquivos (HTML, CSS, 2 JS)

### Funções/Métodos Declarados: 50+
- **Servidor:** ~35 funções
- **Cliente:** ~15 funções

### Documentação
Cada arquivo contém:
- ✅ Cabeçalho descritivo completo
- ✅ Objetivo do módulo
- ✅ Lista de funções/responsabilidades
- ✅ Resultado esperado
- ✅ Comentários TODO para implementação
- ✅ Documentação JSDoc de cada função

---

## Próximas Fases Recomendadas

### Fase 1: Implementação do Servidor Base
**Prioridade:** ALTA

**Ordem de Implementação:**
1. `utils/httpUtils.js` - Base para respostas HTTP
2. `utils/jsonUtils.js` - Base para parsing JSON
3. `models/patientModel.js` - Modelo de dados
4. `repository/patientRepository.js` - Armazenamento
5. `controllers/patientController.js` - Lógica de aplicação
6. `router.js` - Roteamento
7. `server.js` - Servidor principal

**Testes após Fase 1:**
- Servidor inicia sem erros
- Roteamento funciona (404 para rotas inválidas)
- Operações CRUD básicas funcionam via curl/Postman

---

### Fase 2: Implementação do Cliente Base
**Prioridade:** ALTA

**Ordem de Implementação:**
1. `index.html` - Completar formulários
2. `css/styles.css` - Estilos funcionais
3. `js/api.js` - Comunicação com servidor
4. `js/ui.js` - Lógica de interface

**Testes após Fase 2:**
- Formulários funcionam
- Comunicação com servidor estabelecida
- Operações CRUD funcionam via interface web

---

### Fase 3: Refinamento e Validações
**Prioridade:** MÉDIA

**Tarefas:**
- Implementar validações completas
- Melhorar tratamento de erros
- Adicionar feedback visual aprimorado
- Implementar persistência em arquivo
- Testes de integração

---

### Fase 4: Documentação Final
**Prioridade:** MÉDIA

**Tarefas:**
- Criar README.md com instruções de execução
- Documentar casos de teste
- Preparar relatório técnico (SBC)
- Criar apresentação/demonstração

---

## Observações Importantes

### Restrições Mantidas
✅ Nenhum framework externo utilizado
✅ Apenas módulos nativos do Node.js
✅ JavaScript puro no cliente
✅ Estrutura conforme guias técnicos

### Padrões Seguidos
✅ Separação clara de camadas
✅ Nomenclatura consistente
✅ Comentários em português
✅ Documentação inline completa

### Arquitetura REST
✅ Rotas seguem padrão RESTful
✅ Códigos HTTP corretos planejados
✅ Stateless design
✅ Identificadores inteiros positivos

---

## Checklist de Validação

- [x] Estrutura de pastas criada corretamente
- [x] Todos os arquivos do servidor criados
- [x] Todos os arquivos do cliente criados
- [x] Cada arquivo tem documentação de cabeçalho
- [x] Todas as funções declaradas com comentários
- [x] TODOs marcados para implementação
- [x] Exports/imports preparados
- [x] Nenhum framework externo utilizado
- [x] Conformidade com guias técnicos
- [x] CLAUDE.md atualizado

---

## Conclusão da Fase 0

A estrutura completa do projeto PatientsOnFIRE foi criada com sucesso. Todos os arquivos estão preparados com documentação detalhada e declarações de funções, prontos para implementação nas próximas fases.

**Status do Projeto:** PRONTO PARA FASE 1 - IMPLEMENTAÇÃO

**Próximo Passo:** Iniciar Fase 1 com implementação dos utilitários do servidor.

**Data de Conclusão:** 2025-11-22
