# **Guia de Projeto e Relatório: Sistema PatientsOnFIRE**

## **Fundamentos de Redes de Computadores e Sistemas Distribuídos \- 2025/2**

Este documento serve como estrutura base detalhada para o relatório técnico (formato SBC) e como documento de visão arquitetural do sistema, orientando o desenvolvimento e a documentação final.

### **1\. Introdução**

Nesta seção, deve-se contextualizar a importância da interoperabilidade em sistemas de saúde modernos e apresentar a solução proposta como uma resposta a esses desafios técnicos.

* **1.1. Contexto da Saúde Digital e Interoperabilidade**  
  * **Necessidade de Sistemas Distribuídos:** Discutir como a assistência à saúde moderna envolve múltiplos atores (hospitais, clínicas, laboratórios) geograficamente dispersos. Sistemas distribuídos são essenciais para conectar essas entidades sem exigir uma centralização física de todos os dados.  
  * **Fragmentação de Dados:** Introduzir o problema crítico dos "silos de informação", onde o histórico de um paciente está fragmentado entre diferentes instituições, aumentando o risco de erros médicos e redundância de exames.  
  * **Padronização:** Citar a importância de padrões internacionais (como HL7) para garantir que sistemas heterogêneos (desenvolvidos em diferentes linguagens e plataformas) possam "conversar" e trocar dados de forma semântica e estruturada.  
* **1.2. O Padrão HL7 FHIR**  
  * **Definição:** Explicação sobre o *Fast Healthcare Interoperability Resources* (FHIR) como a nova geração de padrões de saúde, focado na facilidade de implementação web.  
  * **Estrutura de Recursos:** Detalhar o conceito de "Recursos" (*Resources*) como blocos de construção modulares.  
  * **Foco no Recurso Patient:** Análise específica do recurso *Patient* na versão 5.0.0, que encapsula dados administrativos e demográficos (não clínicos diretos), servindo como índice mestre para outros dados de saúde.  
* **1.3. Visão Geral da Solução (PatientsOnFIRE)**  
  * **Conceito:** Apresentação do sistema *Patients On FHIR Information Retrieval Environment* (PatientsOnFIRE).  
  * **Arquitetura de Alto Nível:** Definição do sistema como uma solução distribuída baseada estritamente no protocolo HTTP, onde um cliente leve interage com um servidor de recursos através de uma API RESTful padronizada.

### **2\. Objetivos**

Definição clara e granular do que será alcançado técnica e funcionalmente com o projeto.

* **2.1. Objetivo Geral**  
  * Projetar e implementar uma aplicação de rede completa baseada na arquitetura de serviços web REST, consolidando os conhecimentos de comunicação entre processos. O sistema será composto por um servidor (backend) que gerencia o estado dos recursos e um cliente (frontend) que consome esses serviços para manipulação de dados clínicos.  
* **2.2. Objetivos Específicos**  
  * **Backend (Servidor):** Desenvolver o servidor **PatientsOnFIRE** utilizando JavaScript e o ambiente de execução Node.js, sem dependência excessiva de frameworks que ocultem o funcionamento do protocolo HTTP.  
  * **Frontend (Cliente):** Desenvolver a aplicação **CRUDEPatients** como uma interface Web dinâmica, focada na experiência do usuário para operações de gestão de dados.  
  * **Persistência de Dados:** Implementar a lógica de armazenamento e recuperação do recurso *Patient* seguindo rigorosamente o esquema JSON do FHIR v5.0.0.  
  * **Conformidade RESTful:** Garantir a aplicação correta das "constraints" REST, incluindo o uso semântico dos verbos HTTP (GET, POST, PUT, DELETE) e, crucialmente, dos códigos de status (Status Codes) para indicar sucesso ou falha.  
  * **Operações Completas:** Implementar o ciclo de vida completo da informação (CRUD) e a rota auxiliar de descoberta (/PatientIDs).

### **3\. Metodologia (Arquitetura e Implementação)**

Esta é a seção mais técnica, descrevendo "como" o sistema funciona, as decisões de design tomadas e os padrões adotados.

* **3.1. Arquitetura de Software**  
  * **Modelo Cliente-Servidor:** Descrição da separação clara de responsabilidades. O cliente lida com a apresentação e interação humana; o servidor lida com regras de negócio, validação de dados e persistência.  
  * **Estilo Arquitetural REST:**  
    * **Statelessness (Apatridia):** Explicação de como cada requisição HTTP deve conter toda a informação necessária para ser compreendida pelo servidor, sem depender de contexto de sessão armazenado no backend.  
    * **Recursos Identificáveis:** Como cada paciente é acessado através de uma URI única e persistente.  
    * **Interface Uniforme:** A padronização das operações independente do recurso manipulado.  
* **3.2. Tecnologias e Ferramentas**  
  * **Linguagem:** JavaScript utilizada em todo o stack (Full Stack JS), facilitando o compartilhamento de modelos de dados e validações.  
  * **Ambiente de Execução (Servidor):** Node.js pela sua natureza assíncrona e orientada a eventos (Event Loop), ideal para aplicações de rede com alta I/O.  
  * **Interface (Cliente):** HTML5 Dinâmico \+ JavaScript (Manipulação de DOM e Fetch API para requisições assíncronas).  
  * **Formato de Representação:** JSON (JavaScript Object Notation) como formato nativo de intercâmbio, eliminando a necessidade de parsers complexos (como seria com XML).  
* **3.3. Modelagem de Dados (O Recurso Patient)**  
  * **Estrutura JSON:** Detalhamento dos campos mapeados do diagrama UML do FHIR para o JSON.  
  * **Campos Obrigatórios e Opcionais:** Discussão sobre campos como identifier (gerado pelo servidor), active (booleano), name (estrutura complexa com family e given), telecom, gender, birthDate, e address.  
  * **Extensibilidade:** Menção breve sobre como o modelo permite múltiplos endereços ou formas de contato.  
* **3.4. Especificação da API (Endpoints e Contratos)**  
  * Descrição técnica das rotas, detalhando Inputs e Outputs:  
    * **Create (POST):** /{caminho}/Patient  
      * *Comportamento:* Recebe JSON sem ID. Servidor gera ID único.  
      * *Retorno:* Status 201 Created \+ Header Location contendo a URL do novo recurso.  
    * **Read (GET):** /{caminho}/Patient/{ID}  
      * *Comportamento:* Busca por ID numérico.  
      * *Retorno:* JSON do paciente (200 OK) ou erro se não existir (404 Not Found).  
    * **Update (PUT):** /{caminho}/Patient/{ID}  
      * *Comportamento:* Substituição total do recurso (Idempotência). Se o ID na URL não bater com o corpo, retorna erro (400 Bad Request).  
      * *Retorno:* Status 200 OK com o conteúdo atualizado.  
    * **Delete (DELETE):** /{caminho}/Patient/{ID}  
      * *Comportamento:* Remoção do recurso.  
      * *Retorno:* Status 200 OK (com corpo), 204 No Content (sem corpo) ou 410 Gone (se o servidor quiser informar que já existiu mas foi removido).  
    * **Listing (GET):** /{caminho}/PatientIDs  
      * *Propósito:* Rota auxiliar para permitir que o cliente descubra quais recursos existem para popular listas de seleção.  
      * *Retorno:* Array JSON simples \[1, 5, 8...\].

### **4\. Resultados Esperados (Visão do Produto)**

Descrição funcional do sistema entregue, focando na experiência de uso e na robustez do servidor.

* **4.1. Funcionalidades do Servidor (Backend)**  
  * **Processamento de Requisições:** Capacidade de realizar parse de URLs e Body JSON.  
  * **Gerenciamento de IDs:** Algoritmo para garantir unicidade de IDs (ex: auto-incremento ou UUID numérico) e tratamento de IDs no Payload.  
  * **Tratamento de Erros Robusto:** O servidor não deve falhar silenciosamente.  
    * 400 Bad Request: Para sintaxe JSON inválida ou IDs incompatíveis.  
    * 422 Unprocessable Entity: Para violação de regras de negócio (ex: data de nascimento futura).  
* **4.2. Funcionalidades da Aplicação Cliente (CRUDEPatients)**  
  * **Interface Amigável:** Design que abstrai a complexidade do JSON FHIR para o usuário final.  
  * **Interatividade:** Uso de AJAX/Fetch para atualizar a tela sem recarregar a página (SPA \- Single Page Application behavior).  
  * **Fluxo de Trabalho:** Listagem de pacientes existentes \-\> Seleção para visualização detalhada \-\> Edição ou Exclusão.  
* **4.3. Cenários de Uso e Teste (Validação)**  
  * **Cenário Feliz:** Usuário cadastra paciente "João" \-\> Servidor retorna ID 1 \-\> Usuário lista IDs \-\> Clica no ID 1 \-\> Vê detalhes \-\> Corrige telefone \-\> Salva \-\> Exclui paciente.  
  * **Cenário de Exceção:** Tentar acessar ID 999 (deve retornar 404); Tentar enviar texto onde deveria ser data; Tentar criar paciente sem dados obrigatórios.

### **5\. Conclusão**

Fechamento acadêmico, análise crítica do desenvolvimento e lições aprendidas.

* **5.1. Síntese do Desenvolvimento**  
  * Recapitulação de como a arquitetura REST atendeu aos requisitos de interoperabilidade propostos pelo trabalho.  
* **5.2. Desafios Encontrados**  
  * Discussão sobre dificuldades técnicas reais, como: mapeamento de objetos complexos do FHIR, manipulação de rotas no Node.js "puro" (sem frameworks como Express, se for o caso), ou tratamento de assincronismo no cliente.  
* **5.3. Contribuição para a Formação**  
  * A consolidação prática dos conceitos teóricos de Sistemas Distribuídos.  
  * Entendimento profundo do protocolo HTTP (não apenas como usuário, mas como engenheiro do protocolo).  
  * Introdução à complexidade real de dados em Informática Biomédica.