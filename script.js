// =========================================================
// DRA. HELENA COSTA — SCRIPT PRINCIPAL
// Calendário + horários + agendamento + formulário
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // =======================================================
  // ANO DO RODAPÉ
  // =======================================================
  const ano = document.getElementById('ano');

  if (ano) {
    ano.textContent = new Date().getFullYear();
  }


  // =======================================================
  // MENU MOBILE
  // =======================================================
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const aberto = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', aberto);
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // =======================================================
  // CALENDÁRIO
  // =======================================================

  const mesAnterior = document.getElementById('mesAnterior');
  const mesProximo = document.getElementById('mesProximo');
  const mesAtual = document.getElementById('mesAtual');
  const calDias = document.getElementById('calDias');

  const dataSelecionada = document.getElementById('dataSelecionada');
  const slots = document.getElementById('slots');

  const resumo = document.getElementById('resumo');
  const resumoData = document.getElementById('resumoData');
  const resumoHora = document.getElementById('resumoHora');
  const resumoMod = document.getElementById('resumoMod');

  const btnConfirmar = document.getElementById('btnConfirmar');


  // Se os elementos do calendário não existirem,
  // não executa essa parte.
  if (
    !mesAnterior ||
    !mesProximo ||
    !mesAtual ||
    !calDias ||
    !dataSelecionada ||
    !slots ||
    !resumo ||
    !resumoData ||
    !resumoHora ||
    !resumoMod ||
    !btnConfirmar
  ) {
    console.warn('Elementos do calendário não encontrados.');
    return;
  }


  // =======================================================
  // CONFIGURAÇÕES
  // =======================================================

  const horariosDisponiveis = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00'
  ];

  let dataAtual = new Date();

  // Remove horas/minutos para evitar problemas de comparação
  dataAtual.setHours(0, 0, 0, 0);

  let dataEscolhida = null;
  let horarioEscolhido = null;


  // =======================================================
  // FUNÇÕES AUXILIARES
  // =======================================================

  function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }


  function formatarDataCurta(data) {
    return data.toLocaleDateString('pt-BR');
  }


  function mesmoDia(data1, data2) {
    return (
      data1.getFullYear() === data2.getFullYear() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getDate() === data2.getDate()
    );
  }


  function ehPassado(data) {
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    return data < hoje;
  }


  // =======================================================
  // RENDERIZAR CALENDÁRIO
  // =======================================================

  function renderizarCalendario() {

    calDias.innerHTML = '';

    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    // Nome do mês
    mesAtual.textContent = new Date(
      ano,
      mes,
      1
    ).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });

    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1);

    // Último dia do mês
    const ultimoDia = new Date(ano, mes + 1, 0);

    // Dia da semana do primeiro dia
    const inicioSemana = primeiroDia.getDay();

    // Espaços antes do primeiro dia
    for (let i = 0; i < inicioSemana; i++) {

      const vazio = document.createElement('span');

      vazio.className = 'dia vazio';

      calDias.appendChild(vazio);
    }


    // Dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {

      const data = new Date(ano, mes, dia);

      data.setHours(0, 0, 0, 0);

      const botao = document.createElement('button');

      botao.type = 'button';

      botao.className = 'dia';

      botao.textContent = dia;


      // Data passada
      if (ehPassado(data)) {
        botao.classList.add('disabled');
        botao.disabled = true;
      }


      // Hoje
      const hoje = new Date();

      hoje.setHours(0, 0, 0, 0);

      if (mesmoDia(data, hoje)) {
        botao.classList.add('hoje');
      }


      // Data selecionada
      if (dataEscolhida && mesmoDia(data, dataEscolhida)) {
        botao.classList.add('selecionado');
      }


      // Clique no dia
      botao.addEventListener('click', () => {

        dataEscolhida = data;

        horarioEscolhido = null;

        renderizarCalendario();

        mostrarHorarios(dataEscolhida);
      });


      calDias.appendChild(botao);
    }
  }


  // =======================================================
  // MOSTRAR HORÁRIOS
  // =======================================================

  function mostrarHorarios(data) {

    dataSelecionada.textContent = formatarData(data);

    slots.innerHTML = '';

    btnConfirmar.disabled = true;

    resumo.hidden = true;

    resumoData.textContent = '—';
    resumoHora.textContent = '—';
    resumoMod.textContent = '—';


    // Título
    const titulo = document.createElement('p');

    titulo.className = 'slots-title';

    titulo.textContent = 'Horários disponíveis:';

    slots.appendChild(titulo);


    horariosDisponiveis.forEach(horario => {

      const botao = document.createElement('button');

      botao.type = 'button';

      botao.className = 'slot';

      botao.textContent = horario;


      botao.addEventListener('click', () => {

        // Remove seleção anterior
        slots.querySelectorAll('.slot').forEach(slot => {
          slot.classList.remove('selecionado');
        });

        // Seleciona atual
        botao.classList.add('selecionado');

        horarioEscolhido = horario;

        atualizarResumo();
      });


      slots.appendChild(botao);
    });
  }


  // =======================================================
  // RESUMO
  // =======================================================

  function atualizarResumo() {

    if (!dataEscolhida || !horarioEscolhido) {
      btnConfirmar.disabled = true;
      resumo.hidden = true;

      return;
    }


    resumoData.textContent = formatarDataCurta(dataEscolhida);

    resumoHora.textContent = horarioEscolhido;

    resumoMod.textContent = 'A definir';


    resumo.hidden = false;

    btnConfirmar.disabled = false;
  }


  // =======================================================
  // MÊS ANTERIOR
  // =======================================================

  mesAnterior.addEventListener('click', () => {

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const mesAtualInicio = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    );


    const mesAnteriorData = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth() - 1,
      1
    );


    // Não permite navegar para meses anteriores ao atual
    if (mesAnteriorData < mesAtualInicio) {
      return;
    }


    dataAtual.setMonth(dataAtual.getMonth() - 1);

    renderizarCalendario();
  });


  // =======================================================
  // PRÓXIMO MÊS
  // =======================================================

  mesProximo.addEventListener('click', () => {

    dataAtual.setMonth(dataAtual.getMonth() + 1);

    renderizarCalendario();
  });


  // =======================================================
  // CONFIRMAR AGENDAMENTO
  // =======================================================

  btnConfirmar.addEventListener('click', () => {

    if (!dataEscolhida || !horarioEscolhido) {
      alert('Selecione uma data e um horário.');

      return;
    }


    const data = formatarDataCurta(dataEscolhida);

    const mensagem =
      `Olá! Gostaria de agendar uma consulta.\n\n` +
      `Data: ${data}\n` +
      `Horário: ${horarioEscolhido}`;


    // Número do WhatsApp
    // TROQUE pelo número real da profissional.
    const telefone = '5511900000000';


    const url =
      `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;


    window.open(url, '_blank');
  });


  // =======================================================
  // INICIAR CALENDÁRIO
  // =======================================================

  renderizarCalendario();


  // =======================================================
  // FORMULÁRIO DE CONTATO
  // =======================================================

  const form = document.getElementById('formContato');

  if (form) {

    form.addEventListener('submit', (e) => {

      e.preventDefault();

      const feedback = document.getElementById('feedback');

      const nome = document
        .getElementById('nome')
        ?.value
        .trim();

      const email = document
        .getElementById('email')
        ?.value
        .trim();

      const mensagem = document
        .getElementById('mensagem')
        ?.value
        .trim();


      const emailOk =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');


      feedback.style.display = 'block';


      if (!nome || !emailOk || !mensagem) {

        feedback.classList.add('erro');

        feedback.textContent =
          'Por favor, preencha todos os campos corretamente.';

        return;
      }


      feedback.classList.remove('erro');

feedback.textContent =
        `Obrigado, ${nome}! Recebemos sua mensagem e retornaremos em breve.`;

      form.reset();
    });

  }

});