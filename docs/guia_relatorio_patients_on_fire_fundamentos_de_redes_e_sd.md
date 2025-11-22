# PatientsOnFIRE: Guia para Elaboração do Relatório do Trabalho Prático de Sistemas Distribuídos

## 1. Introdução

### 1.1 Contextualização da disciplina
- Inserir o trabalho no contexto da disciplina **Fundamentos de Redes de Computadores e Sistemas Distribuídos**, destacando a importância de:
  - Entender o modelo cliente/servidor em redes TCP/IP.
  - Compreender serviços web baseados em HTTP e APIs RESTful.
  - Relacionar redes de computadores com aplicações distribuídas reais da área da saúde.

### 1.2 Motivação e cenário de saúde
- Apresentar o cenário de **interoperabilidade em saúde** e a necessidade de padrões para troca de informações clínicas.
- Introduzir brevemente o padrão **HL7 FHIR v5.0.0**, explicando que:
  - É um padrão internacional para representação e troca de dados em saúde.
  - Organiza os dados em **recursos** (resources), como `Patient`, `Observation`, etc.
- Destacar que o projeto foca no recurso **Patient**, que representa dados demográficos e administrativos dos pacientes.

### 1.3 Descrição geral do sistema PatientsOnFIRE
- Explicar que o trabalho consiste em projetar e implementar um sistema distribuído chamado **PatientsOnFIRE (Patients On FHIR Information Retrieval Environment)**, composto por dois elementos principais:
  - **Servidor PatientsOnFIRE**: serviço web REST em **Node.js**, responsável por gerenciar recursos FHIR do tipo `Patient`.
  - **Cliente CRUDEPatients**: aplicação web em **HTML/JavaScript**, que fornece a interface para criação, leitura, atualização e exclusão de pacientes.
- Enfatizar que o sistema segue uma arquitetura **cliente/servidor** baseada em **serviços web REST** e em uma **API RESTful** aderente às diretrizes de API FHIR v5.0.0.

### 1.4 Escopo do trabalho prático
- Explicar que o escopo do trabalho inclui:
  - Implementação do servidor PatientsOnFIRE com suporte a operações CRUD sobre recursos `Patient` (Create, Read, Update, Delete) e à operação adicional **PatientIDs**.
  - Implementação da aplicação cliente CRUDEPatients, consumindo a API REST do servidor.
  - Elaboração de um **relatório em formato de artigo da SBC**, com no mínimo 10 páginas, descrevendo o projeto, decisões de arquitetura, implementação e avaliação.
- Indicar que o desenvolvimento é feito em grupos de 3 a 5 alunos.

---

## 2. Objetivos

### 2.1 Objetivo geral
- **Projetar, implementar e documentar** um sistema distribuído cliente/servidor baseado em serviços web REST, denominado PatientsOnFIRE, capaz de gerenciar recursos FHIR do tipo `Patient` em formato JSON, aplicando na prática os conceitos de redes de computadores e sistemas distribuídos.

### 2.2 Objetivos específicos técnicos
- Definir uma **arquitetura RESTful** para o sistema, incluindo URL base, rotas, métodos HTTP e formato de dados.
- Implementar o **servidor PatientsOnFIRE** em Node.js, com as seguintes características:
  - Gerenciamento de recursos `Patient` de acordo com o template JSON FHIR v5.0.0.
  - Uso de identificadores lógicos numéricos inteiros positivos para os pacientes.
  - Suporte ao formato de dados **JSON** e ao tipo de recurso **Patient**.
  - Implementação das operações: `Create` (POST), `Read` (GET), `Update` (PUT), `Delete` (DELETE) e `PatientIDs` (GET).
- Implementar o **cliente CRUDEPatients** como página HTML dinâmica com JavaScript, permitindo:
  - Criar novos pacientes.
  - Listar e consultar pacientes por identificador.
  - Atualizar dados de pacientes existentes.
  - Excluir pacientes.
  - Obter e exibir a lista de IDs por meio da operação `PatientIDs`.

### 2.3 Objetivos de aprendizagem e de produto
- Aplicar na prática conceitos de:
  - Comunicação cliente/servidor via HTTP.
  - APIs RESTful e verbos HTTP.
  - Serialização e validação de dados em JSON.
  - Organização modular de código em Node.js e JavaScript.
- Desenvolver uma **visão de produto** para o sistema, considerando:
  - Caso de uso em um ambiente de saúde (ex.: prontuário eletrônico simplificado para cadastro de pacientes).
  - Potenciais extensões futuras (outros recursos FHIR, autenticação, segurança, integração com RNDS).
- Exercitar práticas básicas de **engenharia de software**:
  - Planejamento do desenvolvimento em fases.
  - Versionamento de código e organização de diretórios.
  - Escrita de documentação técnica e relatório acadêmico.

---

## 3. Metodologia

### 3.1 Abordagem geral de desenvolvimento
- Adotar uma abordagem **incremental e iterativa**, organizada em fases:
  1. Levantamento e refinamento de requisitos a partir do enunciado do trabalho.
  2. Modelagem conceitual do recurso `Patient` e da API REST.
  3. Projeto da arquitetura cliente/servidor.
  4. Implementação do servidor PatientsOnFIRE em Node.js.
  5. Implementação do cliente CRUDEPatients em HTML/JavaScript.
  6. Testes de funcionalidade, validação dos requisitos e ajustes.
- Distribuir tarefas entre os integrantes do grupo, definindo responsáveis por:
  - Backend (servidor).
  - Frontend (cliente).
  - Testes e integração.
  - Documentação e relatório.

### 3.2 Modelagem do recurso Patient (FHIR v5.0.0)
- Analisar o **template JSON** do recurso `Patient` na especificação FHIR v5.0.0, identificando:
  - Campos obrigatórios e opcionais que serão suportados no trabalho.
  - Atributos essenciais para identificação e cadastro de pacientes (por exemplo: `identifier`, `active`, `name`, `gender`, `birthDate`, `address`, `telecom`).
- Definir um **subconjunto mínimo funcional** de campos para facilitar a implementação, mantendo aderência ao padrão FHIR.
- Especificar um **modelo de dados interno** em JavaScript para representar pacientes no servidor, espelhando a estrutura JSON FHIR.

### 3.3 Arquitetura do sistema distribuído
- Descrever a arquitetura em termos de camadas e componentes:
  - **Cliente (CRUDEPatients)** rodando no navegador.
  - **Servidor PatientsOnFIRE** rodando em Node.js.
  - **Mecanismo de armazenamento** (em memória, arquivo JSON ou outro mecanismo simples).
- Mostrar um **diagrama de componentes** ou UML indicando:
  - Fluxo de requisições HTTP do cliente para o servidor.
  - Respostas HTTP com dados JSON.
- Detalhar o modelo de **URLs da API**:
  - URL base: `http://<servidor>{/<caminho>}`.
  - Rotas do recurso `Patient`:
    - `POST {<caminho>}/Patient` (Create).
    - `GET {<caminho>}/Patient/<ID>` (Read).
    - `PUT {<caminho>}/Patient/<ID>` (Update).
    - `DELETE {<caminho>}/Patient/<ID>` (Delete).
  - Rota auxiliar:
    - `GET {<caminho>}/PatientIDs` para recuperar lista de IDs existentes.

### 3.4 Implementação do servidor PatientsOnFIRE (Node.js)
- **Tecnologias e ferramentas**:
  - Node.js (versão a definir).
  - Módulo HTTP nativo ou framework (por exemplo, Express), se permitido.
- **Estrutura do código**:
  - Arquivo principal do servidor (ex.: `server.js`).
  - Módulos auxiliares para:
    - Manipulação do recurso `Patient` (criação de objetos, validação de campos).
    - Persistência de dados (em memória ou arquivo).
- **Implementação das operações**:
  - `Create (POST /Patient)`
    - Receber o corpo da requisição em JSON.
    - Validar a estrutura básica do recurso `Patient`.
    - Gerar automaticamente um novo identificador lógico numérico e atribuir ao elemento `identifier`.
    - Armazenar o recurso e responder com **HTTP 201 Created** e cabeçalho `Location` com a URL do recurso.
    - Tratar erros de sintaxe ou dados inválidos com **HTTP 400 Bad Request**, e violações de regra de negócio com **HTTP 422 Unprocessable Entity**.
  - `Read (GET /Patient/<ID>)`
    - Localizar o paciente pelo identificador.
    - Retornar o recurso em JSON com **HTTP 200 OK**.
    - Em caso de ID inexistente, retornar **HTTP 404 Not Found** (ou 410 Gone, se apropriado).
  - `Update (PUT /Patient/<ID>)`
    - Validar se o elemento `identifier` do recurso recebido corresponde ao `<ID>` da URL.
    - Atualizar o recurso armazenado mantendo a estrutura FHIR.
    - Responder com **HTTP 200 OK** em caso de sucesso ou **HTTP 400 Bad Request** em caso de inconsistência.
  - `Delete (DELETE /Patient/<ID>)`
    - Remover o recurso associado ao `<ID>`.
    - Retornar códigos adequados: **200 OK**, **204 No Content** ou **202 Accepted**, conforme a política adotada.
  - `PatientIDs (GET /PatientIDs)`
    - Percorrer o repositório de pacientes e construir um array com todos os IDs numéricos.
    - Retornar **HTTP 200 OK** com `[id1, id2, ...]` em JSON.
    - Se não houver pacientes cadastrados, retornar **HTTP 204 No Content**.

### 3.5 Implementação do cliente CRUDEPatients (HTML/JavaScript)
- **Estrutura da página web**:
  - Formulário para inclusão de novos pacientes (campos principais do recurso `Patient`).
  - Área para listar IDs de pacientes e permitir a seleção de um ID para consulta/edição.
  - Formulário de edição para atualização e exclusão de pacientes.
  - Elementos de interface (botões, mensagens de status, área de exibição de respostas JSON ou mensagens amigáveis).
- **Lógica em JavaScript**:
  - Uso de `fetch()` ou `XMLHttpRequest` para consumir a API REST do servidor.
  - Funções para cada operação:
    - `createPatient()` → POST /Patient.
    - `readPatient(id)` → GET /Patient/<ID>.
    - `updatePatient(id)` → PUT /Patient/<ID>.
    - `deletePatient(id)` → DELETE /Patient/<ID>.
    - `loadPatientIDs()` → GET /PatientIDs.
  - Tratamento de respostas HTTP (códigos de sucesso, erro, mensagens para o usuário).
  - Validação básica de dados antes de enviar requisições.

### 3.6 Estratégia de testes e validação
- **Testes funcionais**:
  - Casos de teste para cada operação da API (Create, Read, Update, Delete, PatientIDs).
  - Testes com dados válidos e inválidos (por exemplo, JSON incompleto, IDs inexistentes, inconsistência entre `identifier` e `<ID>`).
- **Ferramentas de teste**:
  - Testes manuais via navegador usando o cliente CRUDEPatients.
  - Ferramentas como `curl`, Postman ou similares para testar diretamente as rotas do servidor.
- **Critérios de aceitação**:
  - Todas as operações devem retornar os códigos HTTP esperados.
  - Os dados dos pacientes devem ser preservados após as operações de criação e atualização.
  - A lista de IDs deve refletir corretamente o estado do repositório no servidor.

### 3.7 Ambiente de desenvolvimento e execução
- Detalhar o ambiente utilizado:
  - Sistema operacional (ex.: Linux, Windows).
  - Versão do Node.js e navegador utilizado.
  - Dependências adicionais (se houver).
- Descrever, de forma resumida, como executar o sistema (será detalhado no README futuro):
  - Passos para iniciar o servidor PatientsOnFIRE.
  - Passos para abrir o cliente CRUDEPatients no navegador e configurá-lo para acessar o servidor.

---

## 4. Resultados esperados

### 4.1 Resultados funcionais
- Espera-se obter um sistema PatientsOnFIRE capaz de:
  - Criar, ler, atualizar e excluir registros de pacientes (`Patient`) via API REST.
  - Retornar a lista de identificadores de pacientes por meio da operação `PatientIDs`.
  - Ser acessado por meio do cliente CRUDEPatients em um navegador web comum.
- O sistema deve operar exclusivamente com:
  - Recurso FHIR do tipo `Patient`.
  - Formato de dados JSON.
  - Identificadores lógicos numéricos inteiros positivos.

### 4.2 Resultados técnicos e de aprendizagem
- Comprovar, por meio da implementação e dos testes, a compreensão dos seguintes conceitos:
  - Requisições e respostas HTTP (métodos, cabeçalhos, códigos de status).
  - Arquitetura RESTful (recursos, URLs, verbos HTTP, statelessness).
  - Representação de dados em JSON e manipulação em JavaScript.
  - Organização de um sistema distribuído baseado em cliente/servidor.
- Demonstrar a capacidade de integrar **padrões de saúde (FHIR)** com **conceitos de redes e sistemas distribuídos**.

### 4.3 Indicadores de qualidade e avaliação
- Propor métricas simples para avaliar o sistema, como:
  - Taxa de sucesso dos casos de teste.
  - Tempo de resposta médio para operações CRUD em ambiente de teste.
  - Cobertura de campos do recurso `Patient` efetivamente suportados.
- Realizar uma avaliação qualitativa:
  - Clareza e manutenibilidade do código.
  - Usabilidade da interface do cliente CRUDEPatients.
  - Facilidade de implantação e execução do sistema.

### 4.4 Limitações do sistema
- Deixar claro que o sistema apresenta limitações previsíveis, tais como:
  - Suporte apenas ao recurso `Patient` (demais recursos FHIR são ignorados).
  - Ausência de autenticação, autorização e criptografia (sem HTTPS/OAuth).
  - Armazenamento simplificado (em memória ou arquivo local, sem banco de dados robusto).
  - Não integração real com RNDS ou sistemas externos de saúde.

### 4.5 Possíveis extensões futuras
- Apontar caminhos de evolução do projeto, por exemplo:
  - Adicionar novos recursos FHIR (ex.: `Observation`, `Encounter`).
  - Implementar mecanismos de busca mais avançados (filtros por nome, data de nascimento, etc.).
  - Migrar o armazenamento para um banco de dados relacional ou NoSQL.
  - Adicionar segurança (HTTPS, autenticação de usuários, controle de acesso).
  - Criar uma interface gráfica mais rica, eventualmente usando frameworks front-end.

---

## 5. Conclusão

### 5.1 Síntese do projeto
- Reforçar que o trabalho permite integrar conceitos de **redes de computadores**, **sistemas distribuídos** e **informática em saúde**, por meio da implementação de um sistema realista de cadastro de pacientes baseado em FHIR.
- Destacar que o projeto PatientsOnFIRE oferece uma visão prática de como serviços web REST podem ser empregados para viabilizar interoperabilidade em saúde.

### 5.2 Avaliação crítica
- Discutir, no relatório final, em que medida os objetivos foram atingidos:
  - Se todas as operações da API foram implementadas e testadas com sucesso.
  - Se a arquitetura proposta facilitou a implementação e manutenção do código.
  - Quais foram os principais desafios técnicos (ex.: entendimento do FHIR, tratamento de erros HTTP, organização do código em Node.js e JavaScript).

### 5.3 Contribuições para a formação em Informática Biomédica
- Explicar como o trabalho contribui para a formação na área:
  - Compreensão dos requisitos de sistemas em saúde.
  - Contato com padrões amplamente utilizados na prática (HL7 FHIR).
  - Experiência com desenvolvimento de aplicações distribuídas web.

### 5.4 Perspectivas futuras
- Sugerir que o projeto pode servir como base para:
  - Trabalhos futuros na disciplina ou em outras cadeiras relacionadas a **Sistemas de Informação em Saúde**.
  - Projetos de pesquisa ou extensão envolvendo interoperabilidade de dados clínicos.
  - Protótipos mais completos de prontuário eletrônico ou sistemas de apoio à decisão clínica.

---

> Este guia estrutura o relatório em seções e subtópicos alinhados ao enunciado do trabalho e às especificações FHIR, servindo como base para um artigo no formato SBC e para uma futura documentação de implementação (README).

