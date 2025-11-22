# Guia Técnico do Projeto PatientsOnFIRE

> **Escopo:** este documento descreve, de forma puramente técnica, a estrutura de pastas/arquivos, funcionalidades, ambiente de execução, portas e contratos HTTP do sistema **PatientsOnFIRE** (servidor) e da aplicação cliente **CRUDEPatients**, conforme o enunciado do Trabalho Prático de Sistemas Distribuídos.
>
> **Linguagem e restrições:** todo o código deve ser implementado em **JavaScript**, sem uso de frameworks externos. No servidor será usado **Node.js** (apenas módulos nativos). No cliente serão usados **HTML + JavaScript puro** no navegador.

---

## 1. Visão Geral Técnica

- **Nome do sistema servidor:** `PatientsOnFIRE`  
- **Nome da aplicação cliente:** `CRUDEPatients`
- **Arquitetura:** sistema distribuído **cliente/servidor** baseado em **serviços web REST**.  
- **Padrão de dados:** recursos FHIR do tipo **`Patient`**, em **JSON**, conforme a especificação FHIR v5.0.0 (Resource Patient).  
- **API RESTful:** segue as diretrizes de **API Restful FHIR v5.0.0** (http interactions), com adaptações e restrições descritas pelo professor:
  - Somente tipo de recurso **`Patient`** é suportado.
  - Somente formato **JSON** é suportado.
  - Identificadores lógicos (`<ID>` e `identifier`) são **inteiros positivos**.

### 1.1 Componentes principais

1. **Servidor PatientsOnFIRE (Node.js)**  
   - Implementa o serviço web REST.  
   - Expõe as operações **Create**, **Read**, **Update**, **Delete** e **PatientIDs**.  
   - Armazena recursos `Patient` em memória (opcionalmente em arquivo JSON).

2. **Aplicação Cliente CRUDEPatients (HTML/JS)**  
   - Página HTML dinâmica com **JavaScript no navegador**.  
   - Permite criar, ler, atualizar, excluir pacientes e obter a lista de IDs via chamadas HTTP ao servidor.

---

## 2. Estrutura de Pastas e Arquivos

### 2.1 Estrutura mínima recomendada

```text
patients-on-fire/
├── server/
│   ├── server.js
│   ├── router.js
│   ├── controllers/
│   │   └── patientController.js
│   ├── repository/
│   │   └── patientRepository.js
│   ├── models/
│   │   └── patientModel.js
│   ├── utils/
│   │   ├── httpUtils.js
│   │   └── jsonUtils.js
│   └── config.js
├── client/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js
│       └── ui.js
├── docs/
│   └── guia-tecnico.md  (este documento ou equivalente)
├── package.json (opcional, apenas para dependências Node.js nativas / scripts)
└── README.md (guia de execução que será escrito depois)
```

> Observação: os nomes/arquivos podem ser ajustados, mas a ideia é separar **servidor**, **cliente**, **modelo/dados**, **repositório** e **código utilitário**, mantendo o projeto organizado e fácil de documentar.

### 2.2 Descrição dos arquivos principais

#### 2.2.1 Servidor (`server/`)

- **`server.js`**  
  - Ponto de entrada do servidor Node.js.  
  - Responsável por:
    - Criar e iniciar o servidor HTTP (`http.createServer`).
    - Ler configurações (porta, host, basePath) de `config.js`.
    - Encaminhar cada requisição para o módulo `router.js`.

- **`router.js`**  
  - Não usa frameworks de roteamento; implementa roteamento manual.  
  - Responsável por:
    - Analisar `req.method` e `req.url` com o módulo nativo `url`.
    - Normalizar o caminho da URL (remover query string, tratar barras finais).
    - Mapear pares (método HTTP + caminho) para funções em `patientController.js`.
    - Retornar **404 Not Found** ou **405 Method Not Allowed** quando apropriado.

- **`controllers/patientController.js`**  
  - Camada de **lógica de aplicação** para recursos `Patient`.  
  - Não acessa diretamente o objeto de armazenamento; delega ao `patientRepository.js`.  
  - Implementa as funções correspondentes às operações:
    - `handleCreatePatient(req, res)` → operação **Create** (POST /Patient).
    - `handleReadPatient(req, res, id)` → operação **Read** (GET /Patient/<ID>).
    - `handleUpdatePatient(req, res, id)` → operação **Update** (PUT /Patient/<ID>).
    - `handleDeletePatient(req, res, id)` → operação **Delete** (DELETE /Patient/<ID>).
    - `handlePatientIDs(req, res)` → operação **PatientIDs** (GET /PatientIDs).
  - Cada função deve:
    - Ler e validar o corpo da requisição (quando existir) usando `jsonUtils.js`.
    - Aplicar regras da especificação (códigos 201/200/400/404/410/422/204/202 conforme o caso).
    - Chamar o repositório para realizar operações de dados.
    - Construir respostas HTTP com cabeçalhos adequados (via `httpUtils.js`).

- **`repository/patientRepository.js`**  
  - Camada de acesso a dados (armazenamento de recursos `Patient`).  
  - Usa apenas estruturas em memória (por exemplo, um objeto/dicionário JS) e, opcionalmente, persistência simples em arquivo JSON.  
  - Responsabilidades:
    - Manter estrutura interna, por exemplo:
      ```js
      // Exemplo de estrutura interna
      const patients = {
        1: { /* JSON completo do Patient com identifier=1 */ },
        2: { /* ... */ }
      };
      ```
    - Gerar **novos IDs inteiros positivos**.
    - Garantir que o `identifier` contido no recurso corresponda ao ID usado como chave.
    - Expor funções para o controller:
      - `createPatient(patientData)` → retorna o Patient criado com `identifier` definido.
      - `getPatientById(id)` → retorna o Patient ou `null`/`undefined`.
      - `updatePatient(id, patientData)` → substitui o recurso armazenado.
      - `deletePatient(id)` → remove o recurso, retorna o recurso removido ou `null` se não existir.
      - `getAllIds()` → retorna array de IDs (`[1, 5, 8, 11]`).

- **`models/patientModel.js`**  
  - Fornece funções auxiliares para trabalhar com o recurso `Patient` no formato JSON.  
  - Sugestão de responsabilidades mínimas:
    - `normalizePatient(json)` → garante que o objeto esteja na forma esperada (por exemplo, tipo objeto, campos principais existentes).  
    - `setIdentifier(patient, id)` → insere/atualiza o elemento `identifier` com o **inteiro positivo** `id`.
    - `validateIdentifierConsistency(patient, id)` → verifica se `patient.identifier` é igual a `id`.
  - Este módulo **não** implementa validação completa do padrão FHIR; visa apenas garantir o mínimo necessário do trabalho (principalmente `identifier`).

- **`utils/httpUtils.js`**  
  - Funções utilitárias para envio de respostas HTTP:
    - `sendJson(res, statusCode, data)` → define cabeçalhos (`Content-Type: application/json; charset=utf-8`) e envia `JSON.stringify(data)`.
    - `sendError(res, statusCode, message)` → envia objeto JSON padrão de erro, ex.: `{ error: message }`.
    - `sendNoContent(res, statusCode)` → envia resposta sem corpo (204/202).
    - `parseUrl(req)` → encapsula lógica de parsing da URL (`url.parse(req.url, true)`).

- **`utils/jsonUtils.js`**  
  - Leitura e parsing do corpo JSON das requisições:
    - `readJsonBody(req)` → retorna uma `Promise` que:
      - Acumula os chunks recebidos no evento `'data'`.
      - Faz `JSON.parse` no evento `'end'`.
      - Rejeita com erro específico se o JSON for inválido.
  - Opcional: funções para carregar e salvar JSON de/para arquivo (`fs.readFile`, `fs.writeFile`) caso o grupo queira persistir dados.

- **`config.js`**  
  - Contém constantes de configuração do servidor:
    ```js
    module.exports = {
      HOST: '127.0.0.1',    // host local
      PORT: 8080,           // porta padrão do servidor HTTP
      BASE_PATH: '',        // <caminho> opcional; vazio significa URLs como /Patient
      ENABLE_PERSISTENCE: false, // true se usar arquivo JSON
      DATA_FILE: 'patients-data.json' // se persistência estiver ativa
    };
    ```
  - Permite futura parametrização via variáveis de ambiente sem alterar o restante do código.

#### 2.2.2 Cliente (`client/`)

- **`client/index.html`**  
  - Página HTML principal da aplicação CRUDEPatients.  
  - Estrutura mínima recomendada:
    - Formulário para **criação** de paciente (campos básicos, ex.: nome, gênero, data de nascimento, etc. — o conteúdo exato pode ser parcialmente mapeado para FHIR Patient).  
    - Área para **consulta** de paciente a partir de um ID informado.  
    - Formulário ou seção para **atualização** de um paciente existente.  
    - Botão/área para **exclusão** de paciente por ID.  
    - Botão para carregar a lista de IDs (`PatientIDs`) e exibi-la.  
    - Área de exibição de **resultados/respostas** do servidor (em JSON ou em formato amigável ao usuário).
  - Inclui os scripts `js/api.js` e `js/ui.js` via `<script src="...">`.

- **`client/js/api.js`**  
  - Responsável por todas as chamadas HTTP ao servidor PatientsOnFIRE usando `fetch` (ou `XMLHttpRequest`, se preferido).  
  - Define a constante da URL base:
    ```js
    const API_BASE_URL = 'http://127.0.0.1:8080'; // deve corresponder a HOST/PORT de config.js
    ```
  - Funções principais:
    - `createPatient(patientObj)` → `POST /Patient`.
    - `readPatient(id)` → `GET /Patient/<ID>`.
    - `updatePatient(id, patientObj)` → `PUT /Patient/<ID>`.
    - `deletePatient(id)` → `DELETE /Patient/<ID>`.
    - `getPatientIDs()` → `GET /PatientIDs`.
  - Cada função:
    - Monta a URL final conforme o contrato (`/Patient`, `/Patient/<ID>`, `/PatientIDs`).
    - Define o método HTTP correto (`POST`, `GET`, `PUT`, `DELETE`).
    - Para operações com corpo, define `Content-Type: application/json` e faz `JSON.stringify(patientObj)`.
    - Interpreta códigos de resposta:
      - 200, 201 → sucesso com corpo JSON.
      - 204, 202 → sucesso sem corpo.
      - 400, 404, 410, 422 → exibe mensagem de erro apropriada na UI.

- **`client/js/ui.js`**  
  - Camada de interação com o usuário (DOM).  
  - Responsável por:
    - Capturar dados dos formulários HTML.
    - Converter dados do formulário em objetos JSON compatíveis com o recurso `Patient`.
    - Chamar funções de `api.js` e processar respostas.
    - Atualizar a interface (mensagens, resultados, limpar formulários, preencher campos na atualização, etc.).

- **`client/css/styles.css`**  
  - Estilos básicos da interface.  
  - Não tem impacto funcional no trabalho, mas ajuda na organização e leitura do código.

---

## 3. Especificação do Servidor PatientsOnFIRE

### 3.1 Ambiente de execução

- **Runtime:** Node.js (versão recomendada ≥ 18.x).  
- **Módulos nativos utilizados (sem frameworks):**
  - `http` → criação do servidor HTTP.
  - `url` → parsing da URL da requisição.
  - `fs` → (opcional) leitura/escrita de arquivo JSON de dados.
  - `path` → (opcional) normalização de caminhos de arquivos.
- **Host padrão:** `127.0.0.1` (localhost).  
- **Porta padrão:** `8080` (alterável em `config.js`).

### 3.2 Formato geral das URLs e recursos

- O serviço segue o padrão descrito na especificação do professor:
  - URLs de recurso do tipo `Patient`:
    - Lista/Criação: `http://<servidor>{/<caminho>}/Patient`  
    - Recurso individual: `http://<servidor>{/<caminho>}/Patient/<ID>`
  - Interações no padrão:
    - `<VERBO> {<caminho>}/<tipo>/<ID> {?_format=<tipo-MIME>}`
- Para este trabalho prático:
  - `<tipo>` será sempre `Patient`.
  - `<caminho>` será definido como **string vazia** (isto é, o serviço fica diretamente em `/Patient`).  
  - `?_format=<tipo-MIME>` **não deve ser utilizado**, pois o serviço suporta **apenas JSON**.
  - `<ID>` será sempre um **inteiro positivo**.

### 3.3 Contratos HTTP das operações

#### 3.3.1 Operação Create (criação de recurso Patient)

- **Requisição:**
  - Método: `POST`
  - URL: `POST /Patient`
  - Corpo: JSON representando um recurso `Patient`.
    - O recurso **não precisa** conter o elemento `identifier`.
    - Se contiver `identifier`, o servidor **deve ignorar** o valor fornecido.
  - Cabeçalhos mínimos esperados:
    - `Content-Type: application/json`

- **Processamento no servidor:**
  1. Ler e parsear o corpo JSON (`jsonUtils.readJsonBody`).
  2. Validar que o JSON é um objeto representando um Patient (checagem mínima: tipo objeto).
  3. Gerar um novo `<ID>` **inteiro positivo** (ex.: incrementando um contador global).  
  4. Preencher/atualizar o elemento `identifier` do Patient com esse `<ID>`.
  5. Armazenar o Patient no `patientRepository` usando `<ID>` como chave.

- **Respostas possíveis:**
  - **201 Created** (sucesso na criação):
    - Cabeçalho `Location: /Patient/<ID>`.
    - Corpo opcional (podem ser retornados o recurso recém-criado ou apenas um resumo; o enunciado enfatiza o cabeçalho `Location`).
  - **400 Bad Request**:
    - Quando a sintaxe da requisição (JSON) ou os dados do recurso forem incorretos ou inválidos a ponto de impedir a criação.
  - **422 Unprocessable Entity**:
    - Quando o servidor rejeitar o recurso devido a regras de negócio (por exemplo, algum campo obrigatório ausente, se o grupo decidir impor tais regras).

#### 3.3.2 Operação Update (atualização de recurso Patient)

- **Requisição:**
  - Método: `PUT`
  - URL: `PUT /Patient/<ID>`
  - Corpo: JSON representando um recurso `Patient`.
    - O recurso **deve conter** um elemento `identifier` com valor **idêntico** ao `<ID>` da URL.
  - Cabeçalhos:
    - `Content-Type: application/json`

- **Processamento no servidor:**
  1. Ler e parsear o corpo JSON.
  2. Verificar se existe `identifier` e se seu valor é igual ao `<ID>` da URL.
  3. Se houver inconsistência (sem `identifier` ou valor diferente), responder imediatamente com **400 Bad Request**.
  4. Atualizar o recurso no repositório (`patientRepository.updatePatient`).
  5. Garantir que leituras posteriores retornem exatamente o recurso atualizado.

- **Resposta:**
  - **200 OK** se a interação for bem-sucedida e o recurso for atualizado.
  - **400 Bad Request** se `identifier` estiver ausente ou não corresponder ao `<ID>`.

#### 3.3.3 Operação Read (leitura de recurso Patient)

- **Requisição:**
  - Método: `GET`
  - URL: `GET /Patient/<ID>`

- **Processamento no servidor:**
  1. Extrair `<ID>` da URL e validar que é um inteiro positivo.
  2. Buscar o recurso no repositório (`patientRepository.getPatientById`).

- **Respostas:**
  - **200 OK**:
    - Corpo: JSON do recurso `Patient` correspondente.
    - O recurso deve conter elemento `identifier` com valor igual a `<ID>`.
  - **404 Not Found** ou **410 Gone** (em leituras posteriores a uma exclusão, conforme política adotada para exclusão, ver abaixo).

#### 3.3.4 Operação Delete (exclusão de recurso Patient)

- **Requisição:**
  - Método: `DELETE`
  - URL: `DELETE /Patient/<ID>`
  - Corpo: vazio.

- **Processamento no servidor:**
  1. Validar `<ID>` (inteiro positivo).
  2. Remover o recurso do repositório (`patientRepository.deletePatient`).
  3. Após exclusão bem-sucedida, o recurso **não deve** mais ser retornado em leituras.

- **Respostas (conforme enunciado):**
  - Após exclusão bem-sucedida **ou se o recurso não existir**:
    - **200 OK** se o servidor optar por retornar o recurso que foi excluído no corpo da resposta.
    - **204 No Content** se não houver conteúdo na resposta.
    - **202 Accepted** se o servidor não desejar se comprometer com o resultado da exclusão.
  - Leituras subsequentes do mesmo `<ID>`:
    - **410 Gone** se o servidor quiser indicar explicitamente que o recurso foi excluído.
    - **404 Not Found** se o servidor não quiser se comprometer com essa informação.

> Recomenda-se escolher uma política consistente, por exemplo: retornar **204 No Content** na exclusão e **404 Not Found** em leituras posteriores.

#### 3.3.5 Operação PatientIDs (obter identificadores de recursos Patient)

- **Requisição:**
  - Método: `GET`
  - URL: `GET /PatientIDs`

- **Processamento no servidor:**
  1. Solicitar ao repositório a lista de IDs (`patientRepository.getAllIds()`).
  2. Se a lista estiver vazia, responder com **204 No Content**.

- **Respostas:**
  - **200 OK**:
    - Corpo: array JSON com IDs, por exemplo: `[1, 5, 8, 11]`.
  - **204 No Content**:
    - Quando não houver nenhum recurso `Patient` armazenado.

### 3.4 Tratamento de erros genéricos

- **404 Not Found**: para qualquer URL não mapeada (`/`, `/foo`, `/Observation`, etc.).
- **405 Method Not Allowed**: quando o caminho for reconhecido, mas o método HTTP não for suportado.
- **500 Internal Server Error**: para erros inesperados não tratados (ex.: exceção durante read/write).  
- Erros devem ser retornados em JSON quando houver corpo, por exemplo:
  ```json
  { "error": "Mensagem descritiva do erro" }
  ```

---

## 4. Especificação da Aplicação Cliente CRUDEPatients

### 4.1 Ambiente de execução

- **Runtime:** Navegador web moderno (Chrome, Firefox, Edge, etc.).  
- **Tecnologias:**
  - HTML5 para marcação.
  - JavaScript puro para lógica (sem frameworks).
  - CSS opcional para estilo.

### 4.2 Fluxo básico de interação

1. Usuário abre `client/index.html` (idealmente servido pelo mesmo host/porta do servidor para evitar problemas de CORS).  
2. Scripts de `ui.js` registram manipuladores de eventos em botões e formulários.  
3. Ao submeter um formulário, `ui.js`:
   - Lê os valores dos campos HTML.  
   - Monta um objeto JavaScript representando os dados do `Patient` (ou apenas o ID, no caso de leitura/exclusão).
   - Chama as funções apropriadas de `api.js`.
4. `api.js` envia a requisição HTTP ao servidor, interpreta o código de status e retorna os dados ou erros para `ui.js`.  
5. `ui.js` atualiza a interface do usuário com os resultados das chamadas.

### 4.3 Requisitos técnicos mínimos da UI

- Deve existir, pelo menos:
  - Um formulário para **criar** paciente (POST /Patient).  
  - Um meio de **consultar** paciente por ID (GET /Patient/<ID>).  
  - Um formulário para **atualizar** paciente por ID (PUT /Patient/<ID>).  
  - Um mecanismo para **excluir** paciente por ID (DELETE /Patient/<ID>).  
  - Um botão para obter e exibir a lista de **IDs** (GET /PatientIDs).
- A UI deve apresentar ao usuário:
  - Mensagens claras de sucesso (ex.: "Paciente criado com ID X").  
  - Mensagens claras de erro (ex.: "Erro 400: requisição inválida").

---

## 5. Configuração, Porta e Execução

### 5.1 Configuração de rede

- **Host padrão:** `127.0.0.1`.  
- **Porta padrão:** `8080`.  
- Esses valores devem ser centralizados em `server/config.js` para facilitar alterações futuras.

### 5.2 Execução típica (para futura documentação de README)

1. Instalar Node.js (se ainda não estiver instalado).  
2. Na raiz do projeto (`patients-on-fire/`), executar:
   ```bash
   node server/server.js
   ```
3. Abrir `client/index.html` no navegador (idealmente servido pelo mesmo servidor Node; por exemplo, estendendo `server.js` para servir arquivos estáticos da pasta `client/`).

> A forma exata de servir a página HTML será detalhada no README de implementação. Tecnicamente, pode-se usar o mesmo servidor HTTP em Node.js para servir tanto a API REST quanto os arquivos estáticos, desde que nenhum framework externo seja usado.

---

## 6. Empacotamento para Entrega

- A entrega deve ser um **arquivo ZIP** contendo, pelo menos:
  - Pasta `server/` com todos os arquivos JavaScript do servidor.
  - Pasta `client/` com a página HTML, scripts JS e CSS, se houver.
  - Pasta `docs/` com o relatório em PDF (artigo SBC) e/ou este guia técnico em formato texto/Markdown.
  - `README.md` com instruções objetivas de execução (a ser preparado depois).

- Todo o código JavaScript deve ser:
  - Claramente comentado nas partes críticas (rotas, tratamento de erros, regras de negócio de FHIR/Patient necessárias).  
  - Organizado conforme a estrutura de pastas descrita ou similar, mantendo separação lógica entre servidor e cliente.

---

Este guia técnico fornece a base estrutural para implementação e documentação do projeto PatientsOnFIRE, alinhando-se ao enunciado do trabalho e minimizando ambiguidades sobre arquivos, pastas, operações REST, ambiente, porta e contratos HTTP.

