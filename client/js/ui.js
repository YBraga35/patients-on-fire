/**
 * ui.js
 *
 * Módulo de interface do usuário para a aplicação CRUDPatients.
 *
 * OBJETIVO:
 * Gerenciar toda a interação do usuário com a interface HTML, incluindo:
 * - Captura de dados de formulários
 * - Chamadas às funções da API (api.js)
 * - Exibição de resultados e mensagens
 * - Atualização dinâmica do DOM
 *
 * FUNCIONALIDADES PRINCIPAIS:
 *
 * 1. Inicialização (init)
 *    - Registrar event listeners em botões e formulários
 *    - Configurar interface inicial
 *
 * 2. Operações CRUD:
 *    - onCreatePatient(): Captura form de criação, chama api.createPatient()
 *    - onReadPatient(): Captura ID, chama api.readPatient(), exibe dados
 *    - onUpdatePatient(): Captura form de edição, chama api.updatePatient()
 *    - onDeletePatient(): Confirma e chama api.deletePatient()
 *    - onLoadPatientIDs(): Chama api.getPatientIDs(), exibe lista
 *
 * 3. Manipulação de UI:
 *    - displayPatient(): Exibe dados de um paciente na interface
 *    - displayPatientList(): Exibe lista de IDs
 *    - displayMessage(): Exibe mensagens de sucesso/erro
 *    - clearForms(): Limpa formulários
 *    - populateEditForm(): Preenche form de edição com dados de paciente
 *
 * 4. Conversão de Dados:
 *    - formToPatient(): Converte dados do form HTML para objeto Patient JSON
 *    - patientToForm(): Converte objeto Patient para valores de form
 *
 * RESULTADO ESPERADO:
 * Interface responsiva e amigável que permite ao usuário realizar todas
 * as operações CRUD sobre pacientes, com feedback claro de sucesso/erro.
 */

/**
 * Inicializa a interface do usuário.
 * Deve ser chamada quando o DOM estiver carregado.
 */
function init() {
  console.log('[UI] Initializing...');

  // Registrar event listener para formulário de criação
  const createForm = document.getElementById('create-form');
  if (createForm) {
    createForm.addEventListener('submit', onCreatePatient);
  }

  // Registrar event listener para botão de busca
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', onReadPatient);
  }

  // Registrar event listener para formulário de atualização
  const updateForm = document.getElementById('update-form');
  if (updateForm) {
    updateForm.addEventListener('submit', onUpdatePatient);
  }

  // Registrar event listener para botão de exclusão
  const deleteBtn = document.getElementById('delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', onDeletePatient);
  }

  // Registrar event listener para botão de carregar IDs
  const loadIdsBtn = document.getElementById('load-ids-btn');
  if (loadIdsBtn) {
    loadIdsBtn.addEventListener('click', onLoadPatientIDs);
  }

  displayMessage('Sistema pronto. Use os formulários para gerenciar pacientes.', 'info');
  console.log('[UI] Initialization complete');
}

/**
 * Handler para criação de novo paciente.
 * Captura dados do formulário e envia para API.
 */
async function onCreatePatient(event) {
  event.preventDefault();

  try {
    displayMessage('Criando paciente...', 'info');

    // Capturar dados do formulário
    const form = event.target;
    const patientObj = formToPatient(form);

    // Chamar API
    const createdPatient = await createPatient(patientObj);

    // Exibir mensagem de sucesso
    displayMessage(`Paciente criado com sucesso! ID: ${createdPatient.identifier}`, 'success');

    // Limpar formulário
    form.reset();

    // Atualizar lista de IDs
    await onLoadPatientIDs();

  } catch (error) {
    displayMessage(`Erro ao criar paciente: ${error.message}`, 'error');
    console.error('[UI] Create error:', error);
  }
}

/**
 * Handler para leitura de paciente por ID.
 */
async function onReadPatient() {
  try {
    // Capturar ID do input
    const idInput = document.getElementById('search-id');
    const id = idInput.value.trim();

    if (!id || isNaN(id) || Number(id) <= 0) {
      displayMessage('Por favor, digite um ID válido (número positivo)', 'error');
      return;
    }

    displayMessage(`Buscando paciente ${id}...`, 'info');

    // Chamar API
    const patient = await readPatient(id);

    // Exibir dados do paciente
    displayPatient(patient);
    displayMessage(`Paciente ${id} carregado com sucesso`, 'success');

    // Preencher formulário de edição automaticamente
    populateEditForm(patient);

  } catch (error) {
    if (error.status === 404) {
      displayMessage(`Paciente não encontrado`, 'error');
      document.getElementById('patient-display').innerHTML = '<p class="placeholder">Nenhum paciente encontrado</p>';
    } else {
      displayMessage(`Erro ao buscar paciente: ${error.message}`, 'error');
    }
    console.error('[UI] Read error:', error);
  }
}

/**
 * Handler para atualização de paciente.
 */
async function onUpdatePatient(event) {
  event.preventDefault();

  try {
    // Capturar ID e dados do formulário
    const form = event.target;
    const id = document.getElementById('update-id').value;

    if (!id) {
      displayMessage('Nenhum paciente selecionado para atualização. Busque um paciente primeiro.', 'error');
      return;
    }

    displayMessage(`Atualizando paciente ${id}...`, 'info');

    // Converter formulário para objeto Patient
    const patientObj = formToPatient(form);

    // Chamar API
    const updatedPatient = await updatePatient(id, patientObj);

    // Exibir mensagem de sucesso
    displayMessage(`Paciente ${id} atualizado com sucesso!`, 'success');

    // Atualizar exibição
    displayPatient(updatedPatient);

  } catch (error) {
    if (error.status === 404) {
      displayMessage(`Paciente não encontrado`, 'error');
    } else {
      displayMessage(`Erro ao atualizar paciente: ${error.message}`, 'error');
    }
    console.error('[UI] Update error:', error);
  }
}

/**
 * Handler para exclusão de paciente.
 */
async function onDeletePatient() {
  try {
    // Capturar ID do input
    const idInput = document.getElementById('delete-id');
    const id = idInput.value.trim();

    if (!id || isNaN(id) || Number(id) <= 0) {
      displayMessage('Por favor, digite um ID válido (número positivo)', 'error');
      return;
    }

    // Confirmar com usuário
    const confirmed = confirm(`Tem certeza que deseja excluir o paciente ${id}? Esta ação não pode ser desfeita.`);
    if (!confirmed) {
      return;
    }

    displayMessage(`Excluindo paciente ${id}...`, 'info');

    // Chamar API
    await deletePatient(id);

    // Exibir mensagem de sucesso
    displayMessage(`Paciente ${id} excluído com sucesso!`, 'success');

    // Limpar input
    idInput.value = '';

    // Limpar exibição se estava mostrando este paciente
    const currentDisplay = document.getElementById('patient-display');
    if (currentDisplay && currentDisplay.dataset.patientId === id) {
      currentDisplay.innerHTML = '<p class="placeholder">Paciente excluído</p>';
    }

    // Atualizar lista de IDs
    await onLoadPatientIDs();

  } catch (error) {
    if (error.status === 404) {
      displayMessage(`Paciente não encontrado`, 'error');
    } else {
      displayMessage(`Erro ao excluir paciente: ${error.message}`, 'error');
    }
    console.error('[UI] Delete error:', error);
  }
}

/**
 * Handler para carregar lista de IDs.
 */
async function onLoadPatientIDs() {
  try {
    displayMessage('Carregando lista de pacientes...', 'info');

    // Chamar API
    const ids = await getPatientIDs();

    // Exibir lista
    displayPatientList(ids);

    if (ids.length === 0) {
      displayMessage('Nenhum paciente cadastrado no sistema', 'info');
    } else {
      displayMessage(`${ids.length} paciente(s) encontrado(s)`, 'success');
    }

  } catch (error) {
    displayMessage(`Erro ao carregar lista: ${error.message}`, 'error');
    console.error('[UI] Load IDs error:', error);
  }
}

/**
 * Exibe dados de um paciente na interface.
 *
 * @param {Object} patient - Objeto Patient
 */
function displayPatient(patient) {
  const displayDiv = document.getElementById('patient-display');
  if (!displayDiv) return;

  // Armazenar ID do paciente no elemento
  displayDiv.dataset.patientId = patient.identifier;

  // Construir HTML com dados do paciente
  let html = '<div class="patient-card">';
  html += `<h3>Paciente ID: ${patient.identifier}</h3>`;

  // Status ativo
  html += `<p><strong>Status:</strong> ${patient.active ? 'Ativo' : 'Inativo'}</p>`;

  // Nome
  if (patient.name && patient.name.length > 0) {
    const name = patient.name[0];
    const fullName = `${name.given ? name.given.join(' ') : ''} ${name.family || ''}`.trim();
    html += `<p><strong>Nome:</strong> ${fullName || 'Não informado'}</p>`;
  }

  // Gênero
  if (patient.gender) {
    const genderMap = {
      'male': 'Masculino',
      'female': 'Feminino',
      'other': 'Outro',
      'unknown': 'Não informado'
    };
    html += `<p><strong>Gênero:</strong> ${genderMap[patient.gender] || patient.gender}</p>`;
  }

  // Data de nascimento
  if (patient.birthDate) {
    html += `<p><strong>Data de Nascimento:</strong> ${patient.birthDate}</p>`;
  }

  // Dados completos em JSON (para debug)
  html += '<details><summary>Dados Completos (JSON)</summary>';
  html += `<pre>${JSON.stringify(patient, null, 2)}</pre>`;
  html += '</details>';

  html += '</div>';

  displayDiv.innerHTML = html;
}

/**
 * Exibe lista de IDs de pacientes.
 *
 * @param {number[]} ids - Array de IDs
 */
function displayPatientList(ids) {
  const listDiv = document.getElementById('ids-list');
  if (!listDiv) return;

  if (ids.length === 0) {
    listDiv.innerHTML = '<p class="placeholder">Nenhum paciente cadastrado</p>';
    return;
  }

  // Criar lista clicável
  let html = '<ul class="patient-ids-list">';
  ids.forEach(id => {
    html += `<li class="patient-id-item" data-id="${id}">`;
    html += `<span class="id-badge">ID: ${id}</span>`;
    html += `<button class="btn-small" onclick="loadPatientById(${id})">Visualizar</button>`;
    html += '</li>';
  });
  html += '</ul>';

  listDiv.innerHTML = html;
}

/**
 * Função auxiliar para carregar paciente ao clicar na lista.
 * @param {number} id - ID do paciente
 */
function loadPatientById(id) {
  const searchInput = document.getElementById('search-id');
  if (searchInput) {
    searchInput.value = id;
    onReadPatient();
  }
}

/**
 * Exibe mensagem para o usuário.
 *
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function displayMessage(message, type = 'info') {
  const messageArea = document.getElementById('message-area');
  if (!messageArea) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    return;
  }

  // Criar elemento de mensagem
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;

  // Limpar mensagens anteriores
  messageArea.innerHTML = '';

  // Adicionar nova mensagem
  messageArea.appendChild(messageDiv);

  // Auto-remover após 5 segundos (exceto erros)
  if (type !== 'error') {
    setTimeout(() => {
      if (messageDiv.parentNode === messageArea) {
        messageArea.removeChild(messageDiv);
      }
    }, 5000);
  }
}

/**
 * Limpa todos os formulários.
 */
function clearForms() {
  const createForm = document.getElementById('create-form');
  const updateForm = document.getElementById('update-form');

  if (createForm) createForm.reset();
  if (updateForm) updateForm.reset();

  const patientDisplay = document.getElementById('patient-display');
  if (patientDisplay) {
    patientDisplay.innerHTML = '<p class="placeholder">Nenhum paciente carregado</p>';
  }
}

/**
 * Preenche formulário de edição com dados de um paciente.
 *
 * @param {Object} patient - Objeto Patient
 */
function populateEditForm(patient) {
  // Armazenar ID em campo oculto
  const idField = document.getElementById('update-id');
  if (idField) {
    idField.value = patient.identifier;
  }

  // Preencher campos
  const familyNameField = document.getElementById('update-family-name');
  const givenNameField = document.getElementById('update-given-name');
  const genderField = document.getElementById('update-gender');
  const birthDateField = document.getElementById('update-birthdate');
  const activeField = document.getElementById('update-active');

  // Nome
  if (patient.name && patient.name.length > 0) {
    const name = patient.name[0];
    if (familyNameField) familyNameField.value = name.family || '';
    if (givenNameField) givenNameField.value = name.given ? name.given.join(' ') : '';
  }

  // Gênero
  if (genderField && patient.gender) {
    genderField.value = patient.gender;
  }

  // Data de nascimento
  if (birthDateField && patient.birthDate) {
    birthDateField.value = patient.birthDate;
  }

  // Status ativo
  if (activeField) {
    activeField.checked = patient.active !== false;
  }
}

/**
 * Converte dados do formulário para objeto Patient FHIR.
 *
 * @param {HTMLFormElement} form - Formulário HTML
 * @returns {Object} Objeto Patient no formato FHIR
 */
function formToPatient(form) {
  // Determinar qual formulário (create ou update)
  const isUpdate = form.id === 'update-form';
  const prefix = isUpdate ? 'update-' : 'create-';

  // Extrair valores dos campos
  const familyName = form.querySelector(`#${prefix}family-name`).value.trim();
  const givenName = form.querySelector(`#${prefix}given-name`).value.trim();
  const gender = form.querySelector(`#${prefix}gender`).value;
  const birthDate = form.querySelector(`#${prefix}birthdate`).value;
  const active = form.querySelector(`#${prefix}active`).checked;

  // Construir objeto Patient FHIR
  const patient = {
    resourceType: 'Patient',
    active: active
  };

  // Nome (obrigatório tem pelo menos um)
  if (familyName || givenName) {
    patient.name = [{
      family: familyName,
      given: givenName ? givenName.split(' ') : []
    }];
  }

  // Gênero
  if (gender) {
    patient.gender = gender;
  }

  // Data de nascimento
  if (birthDate) {
    patient.birthDate = birthDate;
  }

  return patient;
}

/**
 * Converte objeto Patient para valores de formulário.
 *
 * @param {Object} patient - Objeto Patient
 * @returns {Object} Objeto com valores prontos para inputs
 */
function patientToForm(patient) {
  const formData = {
    familyName: '',
    givenName: '',
    gender: '',
    birthDate: '',
    active: true
  };

  // Extrair nome
  if (patient.name && patient.name.length > 0) {
    const name = patient.name[0];
    formData.familyName = name.family || '';
    formData.givenName = name.given ? name.given.join(' ') : '';
  }

  // Outros campos
  formData.gender = patient.gender || '';
  formData.birthDate = patient.birthDate || '';
  formData.active = patient.active !== false;

  return formData;
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

console.log('ui.js loaded successfully');
