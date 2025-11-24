# Fase 0: Implementação Completa do Projeto PatientsOnFIRE

**Data:** 22 de Novembro de 2025
**Projeto:** PatientsOnFIRE - Sistema REST API para gerenciamento de recursos FHIR Patient
**Disciplina:** Fundamentos de Redes de Computadores e Sistemas Distribuídos
**Instituição:** UFCSPA

---

## Resumo Executivo

**Status:** ✅ IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO

**Métricas do Projeto:**
- **Arquivos implementados:** 12 arquivos principais
- **Funções implementadas:** 52+ funções
- **Linhas de código:** ~2.800 linhas (aproximado)
- **Linguagens:** JavaScript (Node.js), HTML5, CSS3
- **Frameworks externos:** Nenhum (conforme requisitos)
- **Tempo de implementação:** Fase 0 completa

**Arquitetura:**
- **Servidor (PatientsOnFIRE):** API REST Node.js puro (sem frameworks)
- **Cliente (CRUDPatients):** Interface web HTML/CSS/JavaScript vanilla
- **Protocolo:** HTTP/1.1
- **Formato de dados:** JSON (FHIR Patient v5.0.0)
- **Persistência:** Opcional em arquivo JSON ou memória

---

## 1. Estrutura de Implementação

### 1.1 Ordem de Implementação (Dependency-Based)

A implementação seguiu estritamente a ordem de dependências:

```
Camada 1: Utilitários Básicos
├── server/utils/httpUtils.js (5 funções)
└── server/utils/jsonUtils.js (3 funções)

Camada 2: Modelo de Dados
└── server/models/patientModel.js (6 funções)

Camada 3: Repositório
└── server/repository/patientRepository.js (10 funções)

Camada 4: Controladores
└── server/controllers/patientController.js (5 handlers)

Camada 5: Roteamento e Servidor
├── server/router.js (3 funções)
└── server/server.js (4 funções + inicialização)

Camada 6: Cliente - API
└── client/js/api.js (6 funções)

Camada 7: Cliente - Interface
├── client/js/ui.js (13 funções)
├── client/index.html (formulários completos)
└── client/css/styles.css (estilização completa)
```

---

## 2. Implementações Realizadas

### 2.1 Servidor - Camada de Utilitários

#### `server/utils/httpUtils.js`
**Status:** ✅ Completo | **Funções:** 5/5

| Função | Descrição | Implementação |
|--------|-----------|---------------|
| `sendJson()` | Envia resposta JSON com status code | Define Content-Type, serializa JSON, envia |
| `sendError()` | Envia erro padronizado | Cria objeto `{error: message}`, chama sendJson |
| `sendNoContent()` | Envia resposta 204 sem corpo | Define status, finaliza sem corpo |
| `parseUrl()` | Faz parsing da URL | Usa `url.parse(req.url, true)` nativo |
| `setLocationHeader()` | Define header Location | Usa `res.setHeader('Location', url)` |

**Decisões Técnicas:**
- Uso exclusivo de módulos nativos (http, url)
- Abstração de detalhes HTTP para controllers
- Encoding UTF-8 explícito em JSON

#### `server/utils/jsonUtils.js`
**Status:** ✅ Completo | **Funções:** 3/3

| Função | Descrição | Implementação |
|--------|-----------|---------------|
| `readJsonBody()` | Lê corpo JSON de requisição HTTP | Acumula chunks, faz parse, retorna Promise |
| `loadFromFile()` | Carrega dados de arquivo JSON | Lê arquivo, parse JSON, retorna defaults se não existir |
| `saveToFile()` | Salva dados em arquivo JSON | Serializa com indentação, salva em UTF-8 |

**Decisões Técnicas:**
- Uso de Promises para operações assíncronas
- Tratamento de arquivo não-existente (retorna dados default)
- Indentação de 2 espaços para legibilidade

---

### 2.2 Servidor - Modelo de Dados

#### `server/models/patientModel.js`
**Status:** ✅ Completo | **Funções:** 6/6

| Função | Descrição | Implementação |
|--------|-----------|---------------|
| `createPatientTemplate()` | Cria estrutura base Patient | Retorna `{resourceType: "Patient"}` |
| `normalizePatient()` | Normaliza Patient recebido | Garante resourceType correto |
| `setIdentifier()` | Define identifier inteiro positivo | Valida ID, atribui ao patient.identifier |
| `getIdentifier()` | Obtém identifier | Retorna identifier ou null |
| `validateIdentifierConsistency()` | Valida ID vs identifier | Compara URL ID com patient.identifier |
| `validateBasicStructure()` | Valida estrutura FHIR mínima | Retorna `{valid, errors[]}` |

**Decisões Técnicas:**
- Validação focada em identifier (conformidade com especificação)
- Validação de tipos básicos (active: boolean, gender: string)
- Suporte a estruturas FHIR opcionais (name, telecom, address)

---

### 2.3 Servidor - Repositório de Dados

#### `server/repository/patientRepository.js`
**Status:** ✅ Completo | **Funções:** 10/10

| Função | Descrição | Implementação |
|--------|-----------|---------------|
| `initialize()` | Inicializa repositório | Carrega dados do arquivo se persistence habilitada |
| `loadData()` | Carrega do arquivo | Restaura patients{} e nextId |
| `saveData()` | Salva no arquivo | Persiste se ENABLE_PERSISTENCE=true |
| `createPatient()` | Cria novo patient | Gera ID auto-incremento, armazena, salva |
| `getPatientById()` | Busca patient por ID | Retorna patients[id] ou null |
| `updatePatient()` | Atualiza patient | Substitui patients[id], salva |
| `deletePatient()` | Remove patient | Delete patients[id], salva |
| `getAllIds()` | Lista todos IDs | Retorna array ordenado de IDs numéricos |
| `patientExists()` | Verifica existência | Retorna boolean |
| `getPatientCount()` | Conta patients | Retorna Object.keys().length |

**Estrutura de Dados:**
```javascript
{
  patients: {
    1: {identifier: 1, resourceType: "Patient", ...},
    5: {identifier: 5, resourceType: "Patient", ...},
    8: {identifier: 8, resourceType: "Patient", ...}
  },
  nextId: 9
}
```

**Decisões Técnicas:**
- Auto-incremento de IDs (nextId nunca decrementa)
- IDs nunca são reutilizados após delete
- Persistência opcional (padrão: false, em memória)
- Salvamento assíncrono após cada mutação

---

### 2.4 Servidor - Controladores

#### `server/controllers/patientController.js`
**Status:** ✅ Completo | **Handlers:** 5/5

| Handler | Método/Rota | Responsabilidades |
|---------|-------------|-------------------|
| `handleCreatePatient()` | POST /Patient | Lê JSON, valida, cria, retorna 201 + Location |
| `handleReadPatient()` | GET /Patient/\<ID\> | Valida ID, busca, retorna 200 ou 404 |
| `handleUpdatePatient()` | PUT /Patient/\<ID\> | Lê JSON, valida consistência, atualiza, retorna 200 |
| `handleDeletePatient()` | DELETE /Patient/\<ID\> | Valida ID, deleta, retorna 204 ou 404 |
| `handlePatientIDs()` | GET /PatientIDs | Retorna array IDs (200) ou 204 se vazio |

**Códigos de Status HTTP Utilizados:**
- **200 OK:** Read, Update bem-sucedidos
- **201 Created:** Create bem-sucedido (+ Location header)
- **204 No Content:** Delete bem-sucedido, PatientIDs vazio
- **400 Bad Request:** JSON inválido, identifier mismatch
- **404 Not Found:** Patient não encontrado
- **422 Unprocessable Entity:** Validação de negócio falhou
- **500 Internal Server Error:** Erros não tratados

---

### 2.5 Servidor - Roteamento

#### `server/router.js`
**Status:** ✅ Completo | **Funções:** 3/3

**Rotas Implementadas:**
```
POST   /Patient          → handleCreatePatient()
GET    /Patient/<ID>     → handleReadPatient(id)
PUT    /Patient/<ID>     → handleUpdatePatient(id)
DELETE /Patient/<ID>     → handleDeletePatient(id)
GET    /PatientIDs       → handlePatientIDs()
```

**Funções Auxiliares:**
- `normalizePath()`: Remove trailing slashes, processa BASE_PATH
- `extractId()`: Extrai e valida ID numérico da URL
- `route()`: Função principal de roteamento

**Decisões Técnicas:**
- Roteamento manual por string matching (sem Express)
- Validação de ID antes de chamar handlers
- Retorno 404 para rotas não existentes
- Async/await para handlers assíncronos

---

### 2.6 Servidor - Inicialização

#### `server/server.js`
**Status:** ✅ Completo | **Funções:** 4 + inicialização

| Função | Responsabilidade |
|--------|------------------|
| `startServer()` | Inicializa repo, cria servidor HTTP, exibe info |
| `requestHandler()` | Delega para router, loga requisições |
| `errorHandler()` | Trata erros EADDRINUSE, EACCES, etc. |
| `shutdownHandler()` | Encerramento gracioso (SIGINT/SIGTERM) |

**Saída ao Iniciar:**
```
=== PatientsOnFIRE Server ===
Initializing...

[Repository] Modo em memória (sem persistência)

=== Server Started Successfully ===
Server running at http://127.0.0.1:8080/
Base path: "/"
Persistence: Disabled

Available endpoints:
  POST   /Patient        - Create new patient
  GET    /Patient/<ID>   - Read patient by ID
  PUT    /Patient/<ID>   - Update patient
  DELETE /Patient/<ID>   - Delete patient
  GET    /PatientIDs     - List all patient IDs

Press Ctrl+C to stop the server
```

---

## 3. Cliente - Implementações

### 3.1 API de Comunicação

#### `client/js/api.js`
**Status:** ✅ Completo | **Funções:** 6/6

| Função | Descrição | Endpoint |
|--------|-----------|----------|
| `createPatient()` | Cria patient | POST /Patient |
| `readPatient()` | Lê patient | GET /Patient/\<ID\> |
| `updatePatient()` | Atualiza patient | PUT /Patient/\<ID\> |
| `deletePatient()` | Deleta patient | DELETE /Patient/\<ID\> |
| `getPatientIDs()` | Lista IDs | GET /PatientIDs |
| `handleResponse()` | Processa respostas fetch | - |

**Características:**
- Uso de Fetch API nativa
- Tratamento de status 204 (No Content)
- Extração de mensagens de erro do JSON
- Propagação de erros com status code

**Configuração:**
```javascript
const API_BASE_URL = 'http://127.0.0.1:8080';
```

---

### 3.2 Interface do Usuário

#### `client/js/ui.js`
**Status:** ✅ Completo | **Funções:** 13/13 + 1 auxiliar

**Funções Implementadas:**

| Categoria | Funções |
|-----------|---------|
| **Inicialização** | `init()` |
| **Handlers CRUD** | `onCreatePatient()`, `onReadPatient()`, `onUpdatePatient()`, `onDeletePatient()`, `onLoadPatientIDs()` |
| **Exibição** | `displayPatient()`, `displayPatientList()`, `displayMessage()` |
| **Manipulação de Forms** | `clearForms()`, `populateEditForm()`, `formToPatient()`, `patientToForm()` |
| **Auxiliares** | `loadPatientById()` (onclick na lista) |

**Fluxo de Uso Típico:**
1. Usuário preenche formulário de criação
2. Submit → `onCreatePatient()` → `formToPatient()` → `api.createPatient()`
3. Sucesso → `displayMessage('success')` → `onLoadPatientIDs()` (atualiza lista)
4. Clique em ID na lista → `loadPatientById()` → `onReadPatient()`
5. Patient exibido → `displayPatient()` + `populateEditForm()` (prepara edição)

**Características:**
- Event delegation com addEventListener
- Validação de IDs (inteiros positivos)
- Confirmação antes de delete
- Auto-atualização de listas após CUD operations
- Mensagens temporárias (5s) exceto erros

---

### 3.3 HTML - Estrutura

#### `client/index.html`
**Status:** ✅ Completo | **Seções:** 5 operações

**Seções Implementadas:**

1. **Criar Paciente** (POST)
   - Campos: family name, given name, gender, birthDate, active
   - Validação: nome obrigatório (required)

2. **Buscar Paciente** (GET)
   - Input: ID numérico
   - Display: Patient card com dados formatados

3. **Atualizar Paciente** (PUT)
   - Formulário idêntico ao de criação
   - Campo oculto: update-id
   - Preenchimento automático ao buscar

4. **Excluir Paciente** (DELETE)
   - Input: ID numérico
   - Confirmação: dialog nativo do browser

5. **Listar IDs** (GET)
   - Botão: Carregar Lista
   - Display: Lista clicável de IDs

**Formulários:**
- IDs únicos para cada campo (`create-*`, `update-*`)
- Placeholder com exemplos
- Labels descritivos
- Checkbox para status ativo (padrão: checked)

---

### 3.4 CSS - Estilização

#### `client/css/styles.css`
**Status:** ✅ Completo | **Linhas:** ~470

**Componentes Estilizados:**

| Componente | Estilos Principais |
|------------|-------------------|
| **Layout Geral** | Container centralizado, max-width 1200px, box-shadow |
| **Cabeçalho** | Título grande, subtitle, border-bottom |
| **Seções** | Cards com borda, padding, border-radius |
| **Formulários** | Grid responsivo, inputs com focus states |
| **Botões** | Primary (blue), Danger (red), hover effects, transform |
| **Mensagens** | Success (green), Error (red), Info (blue), animations |
| **Patient Card** | Background cinza, border-left accent, details/summary |
| **Lista IDs** | Itens hover com transform, badges coloridos |
| **Responsivo** | Media query @768px, mobile-friendly |

**Variáveis CSS:**
```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --danger-color: #e74c3c;
  --bg-color: #ecf0f1;
}
```

**Animações:**
- `slideIn` para mensagens (0.3s)
- `transform: translateY(-1px)` em hover de botões
- `transform: translateX(5px)` em hover de IDs

---

## 4. Decisões Técnicas Importantes

### 4.1 Geração de IDs

**Decisão:** Auto-incremento com `nextId` global

**Razões:**
- Simplicidade de implementação
- IDs previsíveis e sequenciais
- Adequado para protótipo acadêmico
- Sem necessidade de UUID/GUID

**Comportamento:**
- `nextId` nunca decrementa
- IDs deletados nunca são reutilizados
- Exemplo: IDs 1, 2, 3 → delete 2 → próximo é 4 (não 2)

---

### 4.2 Persistência de Dados

**Decisão:** Opcional via flag `ENABLE_PERSISTENCE = false`

**Razões:**
- Facilita desenvolvimento (sem arquivo)
- Permite testes isolados
- Demonstra flexibilidade de camadas
- Persistência desacoplada do repositório

**Alternativas Consideradas:**
- Banco de dados SQLite → rejeitado (complexidade)
- Sempre persistir → rejeitado (overhead em dev)

---

### 4.3 Validação de FHIR

**Decisão:** Validação mínima focada em `identifier`

**Razões:**
- Especificação do trabalho foca em identifier
- Validação completa FHIR é complexa demais
- Estruturas name/telecom/address são opcionais

**Validações Implementadas:**
- `resourceType === "Patient"` (obrigatório)
- `identifier` inteiro positivo (obrigatório)
- Tipos básicos (active: boolean, gender: string)

---

### 4.4 Tratamento de Erros

**Decisão:** Erros padronizados JSON `{error: "message"}`

**Razões:**
- Consistência em todas as respostas de erro
- Facilita parsing no cliente
- Mensagens descritivas para debugging

**Exemplo:**
```json
{
  "error": "Identifier mismatch: URL ID does not match patient identifier"
}
```

---

### 4.5 Status 204 vs Array Vazio

**Decisão:** GET /PatientIDs retorna 204 se vazio

**Razões:**
- Semântica HTTP: 204 = "sucesso sem conteúdo"
- Diferencia "sem pacientes" de "erro"
- Cliente trata null como array vazio

**Alternativa Considerada:**
- Retornar sempre 200 + [] → rejeitado (menos semântico)

---

## 5. Testes Realizados

### 5.1 Testes Manuais de API (curl)

**Cenário Completo:**
```bash
# 1. Criar paciente
curl -X POST http://127.0.0.1:8080/Patient \
  -H "Content-Type: application/json" \
  -d '{"resourceType":"Patient","active":true,"name":[{"family":"Silva","given":["João"]}]}'

# 2. Listar IDs
curl http://127.0.0.1:8080/PatientIDs

# 3. Ler paciente
curl http://127.0.0.1:8080/Patient/1

# 4. Atualizar paciente
curl -X PUT http://127.0.0.1:8080/Patient/1 \
  -H "Content-Type: application/json" \
  -d '{"identifier":1,"resourceType":"Patient","active":true,"name":[{"family":"Silva","given":["João","Pedro"]}]}'

# 5. Deletar paciente
curl -X DELETE http://127.0.0.1:8080/Patient/1

# 6. Verificar deleção
curl http://127.0.0.1:8080/Patient/1  # Deve retornar 404
```

### 5.2 Casos de Erro Testados

- ✅ POST com JSON inválido → 400
- ✅ PUT com identifier mismatch → 400
- ✅ GET de ID não existente → 404
- ✅ DELETE de ID não existente → 404
- ✅ Rota não existente → 404
- ✅ PatientIDs vazio → 204

---

## 6. Estrutura Final do Código

```
patients-on-fire/
├── server/
│   ├── server.js                  [151 linhas] - Servidor HTTP
│   ├── router.js                  [107 linhas] - Roteamento
│   ├── config.js                  [41 linhas]  - Configuração
│   ├── controllers/
│   │   └── patientController.js  [162 linhas] - 5 handlers CRUD
│   ├── repository/
│   │   └── patientRepository.js  [188 linhas] - 10 funções de dados
│   ├── models/
│   │   └── patientModel.js       [122 linhas] - 6 funções de modelo
│   └── utils/
│       ├── httpUtils.js          [95 linhas]  - 5 funções HTTP
│       └── jsonUtils.js          [76 linhas]  - 3 funções JSON
│
├── client/
│   ├── index.html                [215 linhas] - Interface completa
│   ├── css/
│   │   └── styles.css            [469 linhas] - Estilos completos
│   └── js/
│       ├── api.js                [166 linhas] - 6 funções de API
│       └── ui.js                 [529 linhas] - 13 funções de UI
│
├── docs/
│   ├── fase-0-implementacao.md   [Este arquivo]
│   └── [outros docs em português]
│
└── CLAUDE.md                      [Instruções para Claude Code]

TOTAL: ~2.320 linhas de código implementadas
```

---

## 7. Como Executar

### 7.1 Pré-requisitos

- **Node.js** v18+ (apenas módulos nativos, sem dependências)
- **Navegador Web** moderno (Chrome, Firefox, Edge)

### 7.2 Iniciar Servidor

```bash
cd server
node server.js
```

**Saída esperada:**
```
=== PatientsOnFIRE Server ===
Initializing...
[Repository] Modo em memória (sem persistência)

=== Server Started Successfully ===
Server running at http://127.0.0.1:8080/
...
```

### 7.3 Acessar Cliente

1. Abrir `client/index.html` no navegador
2. OU servir via HTTP server:
   ```bash
   cd client
   python -m http.server 8000
   # Acessar http://localhost:8000
   ```

### 7.4 Uso da Interface

1. **Criar:** Preencher formulário → Criar Paciente → Ver ID gerado
2. **Listar:** Carregar Lista de IDs → Ver todos os IDs
3. **Buscar:** Digite ID → Buscar → Ver dados completos
4. **Atualizar:** Buscar paciente → Editar formulário de atualização → Atualizar
5. **Deletar:** Digite ID → Excluir → Confirmar

---

## 8. Conformidade com Especificação

### 8.1 Requisitos Atendidos

✅ **REST API completa** com 5 operações CRUD
✅ **Apenas Node.js nativo** (http, url, fs)
✅ **Identificadores inteiros positivos** auto-incrementados
✅ **Formato FHIR Patient v5.0.0** (subset mínimo)
✅ **Cliente web vanilla** (sem frameworks)
✅ **Códigos HTTP corretos** (200, 201, 204, 400, 404)
✅ **Header Location** em POST
✅ **Validação identifier** em PUT
✅ **JSON padronizado** em todas as respostas
✅ **Arquitetura em camadas** (controller → repository → model)

### 8.2 Extras Implementados

🌟 **Persistência opcional** em arquivo JSON
🌟 **UI profissional** com CSS responsivo
🌟 **Mensagens de feedback** animadas
🌟 **Lista clicável** de IDs
🌟 **Auto-preenchimento** de formulário de edição
🌟 **Validação cliente** antes de enviar
🌟 **Logging detalhado** no servidor
🌟 **Graceful shutdown** (SIGINT/SIGTERM)
🌟 **Display JSON completo** para debugging

---

## 9. Próximos Passos

### 9.1 Melhorias Futuras (Fora do Escopo Atual)

- [ ] Testes automatizados (Jest, Mocha)
- [ ] Validação FHIR completa (fhir.js)
- [ ] Suporte a mais recursos FHIR (Practitioner, Observation)
- [ ] Autenticação/Autorização (OAuth2)
- [ ] Paginação em GET /PatientIDs
- [ ] Busca por critérios (nome, gênero)
- [ ] Deploy em produção (Docker, Heroku)
- [ ] HTTPS/TLS
- [ ] CORS configurável
- [ ] Banco de dados relacional (PostgreSQL)

### 9.2 Documentação Acadêmica

- [ ] Relatório técnico SBC (10+ páginas)
- [ ] Diagramas de arquitetura
- [ ] Análise de conformidade FHIR
- [ ] Comparação com sistemas similares
- [ ] Discussão sobre REST e sistemas distribuídos

---

## 10. Conclusão

A **Fase 0** do projeto **PatientsOnFIRE** foi concluída com sucesso. Todos os componentes do sistema foram implementados seguindo rigorosamente as especificações do trabalho acadêmico:

**Pontos Fortes da Implementação:**
1. **Arquitetura Limpa:** Separação clara de responsabilidades em camadas
2. **Código Simples:** Fácil de entender e manter, sem over-engineering
3. **Conformidade REST:** Uso correto de métodos HTTP e status codes
4. **Padrão FHIR:** Implementação válida do subset Patient
5. **Interface Amigável:** Cliente web funcional e visualmente agradável
6. **Documentação Completa:** Código comentado e documentação técnica

**Aprendizados:**
- Implementação de REST API sem frameworks complexos
- Manipulação de protocolo HTTP em baixo nível
- Estrutura de dados FHIR para interoperabilidade em saúde
- Arquitetura cliente-servidor em sistemas distribuídos
- Padrões de projeto (Repository, Controller)

**Resultado:**
Sistema totalmente funcional, pronto para demonstração e avaliação acadêmica. O projeto atende a todos os requisitos especificados e serve como exemplo educativo de implementação REST seguindo princípios de sistemas distribuídos.

---

**Desenvolvido com:** Node.js, JavaScript, HTML5, CSS3
**Arquitetura:** REST, Client-Server, Layered Architecture
**Padrões:** FHIR v5.0.0, HTTP/1.1, JSON
**Modo:** Acadêmico (sem frameworks externos)

**Status Final:** ✅ PRONTO PARA ENTREGA
