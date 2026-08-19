/**
 * Extrai o manifesto de narração a partir do index.html.
 *
 * Uso:
 *   node audio-data.js              → gera audios/manifest.json
 *   const { buildManifest } = require('./audio-data');
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = __dirname;
const HTML_PATH = path.join(ROOT, 'index.html');
const OUTPUT_DIR = path.join(ROOT, 'audios');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

/** Textos customizados para slides com pouco conteúdo textual ou conteúdo dinâmico. */
const NARRATION_OVERRIDES = {
  s1:
    'Módulo de Treinamento. Segurança do Trabalho. NR 11 — EMPILHADEIRA. Inclui conteúdo complementar da NR 12. Treinamento de capacitação e reciclagem em movimentação, armazenagem e manuseio de materiais com empilhadeira conforme NR-11.',
  s2:
    'Apresentação. Bem-vindo ao Treinamento. NR11 - OPERADOR DE TRANSPALETEIRA. Assista ao vídeo de introdução e avance quando concluir.',
  s6:
    'Sumário. Conteúdo Programático. Módulo 1: Fundamentos, Legislação e Requisitos. Módulo 2: Conhecendo o Equipamento. Módulo 3: Procedimentos Operacionais e Operação Segura. Módulo 4: Movimentação, Cargas e Armazenamento. Módulo 5: Manutenção e Segurança com Baterias. Módulo 6: Gestão de Riscos, Emergências e EPIs. Módulo 7: NR 12 — Segurança no Trabalho em Máquinas e Equipamentos.',
  's-mod1':
    'Início do Módulo 1. Fundamentos, Legislação e Requisitos.',
  s2b:
    'Vídeo. A Norma NR 11 e os Equipamentos Motorizados. Fundamentos, Legislação e Requisitos. Assista ao vídeo e conheça as exigências legais e a importância do treinamento de segurança na operação de transpaleteiras e outros equipamentos motorizados de movimentação de materiais. Avance quando concluir.',
  s2b2:
    'Vídeo. Habilitação e o Cartão de Identificação. Fundamentos, Legislação e Requisitos. Assista ao vídeo sobre habilitação e o porte obrigatório do cartão de identificação na operação de transpaleteiras. Avance quando concluir.',
  s2b3:
    'Legislação. O Cartão de Identificação. Conforme o item 11.1.6 da NR-11, os operadores de equipamentos de transporte motorizado deverão ser habilitados e só poderão dirigir se durante o horário de trabalho portarem um cartão de identificação, com o nome e fotografia, em lugar visível. Veja a simulação do cartão de identificação à direita, com os dados do operador, fotografia, número de chapa e o respectivo setor de trabalho. Avance quando concluir.',
  s2c:
    'Vídeo. Validade do Cartão e Responsabilidade do Operador. Fundamentos, Legislação e Requisitos. Assista ao vídeo sobre a validade do cartão de identificação e a responsabilidade do operador. Avance quando concluir.',
  s2d: null,
  s2e: null, // montado a partir do deck do jogo Módulo 1
  's-mod2':
    'Início do Módulo 2. Conhecendo o Equipamento.',
  's-mod2-video':
    'Vídeo. Conhecendo a Transpaleteira. Conhecendo o Equipamento. Assista ao vídeo sobre os componentes principais e o funcionamento da transpaleteira. Avance quando concluir.',
  's-mod2-video2':
    'Vídeo. Transpaleteiras Elétricas e Tripuladas. Conhecendo o Equipamento. Assista ao vídeo sobre as transpaleteiras elétricas e tripuladas. Avance quando concluir.',
  's-mod2-video3':
    'Vídeo. Componentes Principais da Transpaleteira. Conhecendo o Equipamento. Assista ao vídeo sobre os componentes principais da transpaleteira. Avance quando concluir.',
  's-mod2-video4':
    'Vídeo. Faixas de Trânsito e Preferências de Passagem. Aptidão Psicofísica, Saúde e Regras de Acesso. Assista ao vídeo sobre faixas de trânsito e preferências de passagem. Avance quando concluir.',
  's-mod2-video5':
    'Vídeo. Bloqueio de Áreas Críticas e Estacionamento Preventivo. Aptidão Psicofísica, Saúde e Regras de Acesso. Assista ao vídeo sobre bloqueio de áreas críticas e estacionamento preventivo. Avance quando concluir.',
  's-mod2-motoristas':
    'Regras para Motoristas e Manobristas. Os motoristas e manobristas devem conduzir seus veículos de forma a proteger o pedestre. Velocidade máxima de 20 quilômetros por hora dentro da unidade. Pisca-alerta e faróis sempre ligados na circulação interna. Cinto obrigatório e somente condutor habilitado. Na faixa de pedestre, pare, olhe os dois lados e dê preferência ao pedestre, com contato visual. Proibido usar ou manusear celular ao dirigir. Nunca bloqueie áreas críticas: não pare sobre faixas, rampas ou em frente a equipamentos de emergência. Carga e descarga somente nas docas, em áreas sinalizadas. Na Red Zone, nunca pessoa e empilhadeira ao mesmo tempo. Parada segura do caminhão: desligado, freio estacionário acionado e trava-rodas. Se precisar descer, use a rota segura pela frente da doca e pelas faixas de pedestres.',
  's-mod5-picking':
    'Abastecimento do Picking. O processo de ressuprir, ou abastecer, o picking parece simples, mas se não for executado seguindo as regras, pode causar graves acidentes. Pessoas são prensadas entre paletes no momento do ressuprimento. Isto ocorre porque a visão do operador é obstruída por paletes, principalmente quando as pessoas estão abaixadas. No corredor de abastecimento, o operador avança com a empilhadeira em direção à célula de picking, onde pode haver um trabalhador abaixado e fora do campo de visão.',
  's-mod5-video-picking':
    'Vídeo. Protocolo de Aproximação Segura no Picking. Operações de Alta Complexidade, Ressuprimento de Picking e Docas. Assista ao vídeo sobre o protocolo de aproximação segura no picking. Avance quando concluir.',
  's-mod5-aproximacao':
    'A Regra Inicial de Ouro. Nunca se aproxime de uma empilhadeira em movimento. Mantenha-se à distância segura de 4 metros e faça contato visual com o condutor para chamar sua atenção. Os 3 passos para a aproximação segura: o pedestre só pode se aproximar e iniciar a conversa após o operador realizar rigorosamente estes três passos. Passo 1: parada total do equipamento. A empilhadeira deve estar completamente estática. Passo 2: descida completa do garfo até o solo. Os garfos devem ser baixados e deitados planos contra o chão. Passo 3: desligamento do motor e retirada da chave. O motor deve ser desligado e a chave de ignição removida pelo operador.',
  's-mod5-doca':
    'Protocolo crítico na doca. Durante todo o processo de carregamento ou descarregamento na doca, um protocolo crítico deve ser seguido. As chaves do caminhão nunca devem permanecer na ignição ou sob a posse do motorista. Elas devem ser recolhidas e mantidas sob a guarda da equipe de expedição para evitar que o veículo saia antes da hora. O motorista externo deve aguardar o fim da operação permanecendo de forma contínua dentro da área segura demarcada e protegida para pedestres. Ele é expressamente proibido de caminhar pela Red Zone ou pela baia operacional enquanto as empilhadeiras realizam as manobras de carga. Organização gera segurança.',
  's-mod5-video-garfos':
    'Vídeo. Riscos de Garfos Elevados e Movimentações Práticas. Operações de Alta Complexidade, Ressuprimento de Picking e Docas. Assista ao vídeo sobre os riscos de dirigir com garfos elevados e as movimentações práticas. Avance quando concluir.',
  's-mod6':
    'Início do Módulo 6. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento.',
  's-mod6-video':
    'Vídeo. O Pit Stop e as Regras de Entrada. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento. Assista ao vídeo sobre o pit stop e as regras de entrada. Avance quando concluir.',
  's-mod6-video2':
    'Vídeo. Proibições Críticas no Abastecimento. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento. Assista ao vídeo sobre as proibições críticas no abastecimento. Avance quando concluir.',
  's-mod6-guia':
    'Guia rápido de segurança do Pit Stop. Regras fundamentais para a baia de abastecimento de GLP e baterias. A área de abastecimento é uma das zonas de maior risco químico e de explosão do armazém. Três regras de acesso e operação. Primeira: permitido apenas um equipamento por vez dentro da baia. Aguarde a sua vez na fila recuada. Segunda: o operador deve apenas estacionar, desligar a máquina e puxar o freio. A troca do cilindro de GLP ou a conexão das baterias é de responsabilidade exclusiva do técnico abastecedor habilitado. Terceira: respeite os avisos de piso e mantenha as saídas do Pit Stop sempre totalmente livres. Fontes de ignição proibidas, tolerância zero. Proibido fumar ou portar qualquer chama exposta. Proibido manusear celulares ou qualquer dispositivo eletrônico ligado, pelo perigo de faíscas estáticas e distração.',
  's-mod6-video3':
    'Vídeo. Manobra de Abastecimento pelo Técnico. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento. Assista ao vídeo sobre a manobra de abastecimento pelo técnico. Avance quando concluir.',
  's-mod6-zonas':
    'Zoneamento de risco do armazém. Entenda onde cada máquina e pessoa deve circular. Para evitar colisões e atropelamentos, o armazém é dividido em três setores de fluxo. Conhecer e respeitar essas barreiras invisíveis é um dever de todos. Zona vermelha: movimentação de empilhadeira. Risco altíssimo de atropelamento e prensagem. Pedestres e ajudantes são proibidos nas ruas de estoque, salvo com bloqueio de segurança. Zona amarela: operações mistas. Risco médio, tráfego compartilhado controlado. Permitido apenas ajudantes com paleteiras e conferentes em auditoria de cargas. Zona verde: paleteiras e pedestres. Risco baixo. Empilhadeiras motorizadas são proibidas nestas vias.',
  's-mod6-video4':
    'Vídeo. Condições Adversas de Luz e Ofuscamento. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento. Assista ao vídeo sobre condições adversas de luz e ofuscamento. Avance quando concluir.',
  's-mod6-video5':
    'Vídeo. Comportamento e a Tolerância Zero a Brincadeiras. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento. Assista ao vídeo sobre comportamento e a tolerância zero a brincadeiras. Avance quando concluir.',
  's-mod6-video6':
    'Vídeo. Compromisso Coletivo e Encerramento. Abastecimento (Pit Stop), Zoneamento de Risco e Comportamento. Assista ao vídeo de compromisso coletivo e encerramento. Avance quando concluir.',
  's-mod7':
    'Início do Módulo 7. NR 12 — Segurança no Trabalho em Máquinas e Equipamentos.',
  's-mod7-video':
    'Vídeo. O que é a NR 12 e o seu Objetivo. NR 12 — Segurança no Trabalho em Máquinas e Equipamentos. Assista ao vídeo sobre o que é a NR 12 e o seu objetivo. Avance quando concluir.',
  's-mod7-video2':
    'Vídeo. Os Deveres e Responsabilidades do Operador. NR 12 — Segurança no Trabalho em Máquinas e Equipamentos. Assista ao vídeo sobre os deveres e responsabilidades do operador. Avance quando concluir.',
  's-mod7-pilares':
    'Os quatro pilares de responsabilidade do operador. A sua atitude determina a segurança de todos. A NR 12 estabelece quatro responsabilidades diárias. Primeiro: inspeção diária. Verifique o estado mecânico e os sistemas de segurança antes de iniciar o turno, sem nenhuma exceção. Segundo: comunicação de falhas. Barulho estranho, mau funcionamento, folga no freio ou falha em luzes: não opere. Comunique imediatamente o supervisor ou a manutenção. Terceiro: respeito absoluto à capacidade. Nunca exceda o limite máximo de carga da placa do fabricante. A sobrecarga gera perda de controle e tombamentos. Quarto: seguir os procedimentos internos de tráfego, manuseio e segurança da empresa.',
  's-mod7-video3':
    'Vídeo. Identificando os Riscos Mecânicos e Elétricos. NR 12 — Segurança no Trabalho em Máquinas e Equipamentos. Assista ao vídeo sobre os riscos mecânicos e elétricos. Avance quando concluir.',
  's-mod7-video4':
    'Vídeo. Dispositivos de Segurança Obrigatórios. NR 12 — Segurança no Trabalho em Máquinas e Equipamentos. Assista ao vídeo sobre os dispositivos de segurança obrigatórios. Avance quando concluir.',
  's-mod7-protecao':
    'Sistemas de proteção e regras de proteção física. Dispositivos obrigatórios: seus escudos contra acidentes. Nunca neutralize, altere ou opere com qualquer dispositivo de segurança desligado ou danificado. Verifique diariamente: a grade de proteção superior, que resguarda a cabeça em caso de queda de objetos; o botão de desligamento de emergência, que trava a energia, a tração e a hidráulica; e a buzina, o giroflex e o alarme de ré, que avisam pedestres em áreas ruidosas. Duas regras de ouro: o cinto de segurança é obrigatório em todos os deslocamentos — em um tombamento, evita que o operador seja arremessado e esmagado pelo chassi. E o corpo deve permanecer sempre dentro do perímetro da cabine: nunca apoie o corpo na coluna de elevação nem coloque membros para fora com o veículo em movimento.',
  's-mod7-video5':
    'Vídeo. Condutas Proibidas e Boas Práticas. NR 12 — Segurança no Trabalho em Máquinas e Equipamentos. Assista ao vídeo sobre condutas proibidas e boas práticas. Avance quando concluir.',
  's-fim':
    'Parabéns. Você concluiu o treinamento NR 11 — Operador de Empilhadeira, com conteúdo complementar da NR 12. Por mérito, dedicação e compromisso com a segurança, você percorreu os sete módulos e demonstrou responsabilidade com a sua vida e com a vida dos seus colegas. A segurança é um direito de todos e um dever de cada um. Continue fazendo a sua parte.',
};

function cleanText(text) {
  return (text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSlideText(slide) {
  const clone = slide.cloneNode(true);
  clone
    .querySelectorAll('script, iframe, svg, .wave, button, style, .nav-btn, .zoom-btn, [id$="-mobile-section"]')
    .forEach((el) => el.remove());

  const custom = slide.getAttribute('data-audio-text');
  if (custom) return cleanText(custom);

  let text = cleanText(clone.textContent || '');

  if (text.length < 40) {
    const iframeTitle = slide.querySelector('iframe[title]')?.getAttribute('title');
    const imgAlt = slide.querySelector('img[alt]')?.getAttribute('alt');
    const title = slide.querySelector('.slide-title')?.textContent;
    const parts = [title, iframeTitle, imgAlt].map(cleanText).filter(Boolean);
    if (parts.length) text = parts.join('. ');
  }

  return text;
}

function parseQuizQuestions(html) {
  const match = html.match(/const\s+q1_questions\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function parseQ5Questions(html) {
  const match = html.match(/const\s+q5_questions\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function parseMod1GameDeck(html) {
  const match = html.match(/const\s+mod1GameDeck\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function parseQm2Questions(html) {
  const match = html.match(/const\s+qm2_questions\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildMod1Narration(deck) {
  if (!deck.length) {
    return 'Quiz NR-11 — Módulo 1. Legislação e Requisitos. Responda a três perguntas rápidas sobre os conceitos legais do módulo e valide seu aprendizado.';
  }

  const parts = [
    'Quiz NR-11 — Módulo 1. Legislação e Requisitos. Responda a três perguntas rápidas sobre os conceitos legais do módulo e valide seu aprendizado.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Pergunta ${index + 1}: ${cleanText(item.text)}`);
    (item.options || []).forEach((opt) => {
      parts.push(`Alternativa ${opt.key}: ${cleanText(opt.text)}`);
    });
    parts.push(`Resposta correta: alternativa ${item.correct}. ${cleanText(item.tip)}`);
  });

  return parts.join(' ');
}

function parseMod2tfDeck(html) {
  const match = html.match(/const\s+mod2tfDeck\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildMod2tfNarration(deck) {
  if (!deck.length) {
    return 'Desafio Módulo 2 — Verdadeiro ou Falso. Responda seis afirmações sobre o equipamento e valide o que você aprendeu no módulo.';
  }

  const parts = [
    'Desafio Módulo 2 — Verdadeiro ou Falso. Responda seis afirmações sobre o equipamento e valide o que você aprendeu no módulo.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Afirmação ${index + 1}: ${cleanText(item.text)}`);
    parts.push(`Resposta correta: ${item.answer ? 'Verdadeiro' : 'Falso'}. ${cleanText(item.tip)}`);
  });

  return parts.join(' ');
}

function buildMod2Narration(questions) {
  if (!questions.length) {
    return 'Quiz — Módulo 2. Conhecendo o Equipamento. Responda cinco perguntas sobre o equipamento. Acerte pelo menos três questões para concluir o módulo.';
  }

  const parts = [
    'Quiz. Conhecendo o Equipamento. Quiz — Módulo 2. Responda cinco perguntas sobre tipos de transpaleteiras, capacidade de carga, componentes principais, painel de controle e funcionamento do timão. Acerte pelo menos três questões para concluir o módulo.',
  ];

  questions.forEach((item, index) => {
    parts.push(`Pergunta ${index + 1}: ${cleanText(item.q)}`);
    item.opts.forEach((opt, optIndex) => {
      const marker = optIndex === item.correct ? 'Resposta correta' : `Alternativa ${optIndex + 1}`;
      parts.push(`${marker}: ${cleanText(opt)}`);
    });
    if (item.feedback_ok) {
      parts.push(cleanText(item.feedback_ok));
    }
  });

  return parts.join(' ');
}

function parseMod3BinaryDeck(html) {
  const match = html.match(/const\s+mod3BinaryDeck\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function parseM3gDeck(html) {
  const match = html.match(/var\s+m3gDeck\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildM3gNarration(deck) {
  if (!deck.length) {
    return 'Desafio Módulo 3 — Missão do Operador. Leia cinco situações reais de operação e escolha a atitude correta.';
  }

  const letters = ['A', 'B', 'C'];
  const parts = [
    'Desafio Módulo 3 — Missão do Operador. Leia cinco situações reais de operação e escolha a atitude correta.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Situação ${index + 1}: ${cleanText(item.sit)}`);
    item.opts.forEach((opt, optIndex) => {
      parts.push(`Alternativa ${letters[optIndex] || optIndex + 1}: ${cleanText(opt)}`);
    });
    parts.push(`Resposta correta: alternativa ${letters[item.ans] || item.ans + 1}. ${cleanText(item.fb)}`);
  });

  return parts.join(' ');
}

function parseM4gDeck(html) {
  const match = html.match(/var\s+m4gDeck\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildM4gNarration(deck) {
  if (!deck.length) {
    return 'Desafio Módulo 4 — Turno Relâmpago. Responda Certo ou Errado para cinco afirmações sobre estabilidade de carga, paletes, tipos de carga e armazenamento.';
  }

  const parts = [
    'Desafio Módulo 4 — Turno Relâmpago. Responda Certo ou Errado para cinco afirmações sobre estabilidade de carga, paletes, tipos de carga e armazenamento.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Afirmação ${index + 1}: ${cleanText(item.text)}`);
    parts.push(`Resposta correta: ${item.ans ? 'Certo' : 'Errado'}. ${cleanText(item.tip)}`);
  });

  return parts.join(' ');
}

function parseM5gDeck(html) {
  const match = html.match(/var\s+m5gDeck\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildM5gNarration(deck) {
  if (!deck.length) {
    return 'Desafio Módulo 5 — Picking, Docas e Protocolos. Leia cinco situações reais e escolha a atitude correta.';
  }

  const letters = ['A', 'B', 'C'];
  const parts = [
    'Desafio Módulo 5 — Picking, Docas e Protocolos. Leia cinco situações reais e escolha a atitude correta.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Situação ${index + 1}: ${cleanText(item.sit)}`);
    item.opts.forEach((opt, optIndex) => {
      parts.push(`Alternativa ${letters[optIndex] || optIndex + 1}: ${cleanText(opt)}`);
    });
    parts.push(`Resposta correta: alternativa ${letters[item.ans] || item.ans + 1}. ${cleanText(item.fb)}`);
  });

  return parts.join(' ');
}

function parseM6gDeck(html) {
  const match = html.match(/var\s+m6gRounds\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildM6gNarration(deck) {
  if (!deck.length) {
    return 'Missão Pit Stop, Módulo 6. Três etapas práticas: acesso ao Pit Stop, proibições e ordem da manobra.';
  }

  const parts = [
    'Missão Pit Stop, Módulo 6. Três etapas práticas: acesso ao Pit Stop, proibições e ordem da manobra.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Etapa ${index + 1}: ${cleanText(item.title)}. ${cleanText(item.inst)}`);
    if (item.type === 'order') {
      parts.push('Ordem correta:');
      item.items.forEach((opt, optIndex) => {
        parts.push(`Passo ${optIndex + 1}: ${cleanText(opt.t)}`);
      });
    } else if (item.type === 'select') {
      const yes = item.items.filter((opt) => opt.ok).map((opt) => cleanText(opt.t));
      const no = item.items.filter((opt) => !opt.ok).map((opt) => cleanText(opt.t));
      parts.push(`Marque: ${yes.join('; ')}.`);
      if (no.length) parts.push(`Não marque: ${no.join('; ')}.`);
    } else {
      item.items.forEach((opt) => {
        parts.push(`${opt.ok ? 'Regra correta' : 'Opção incorreta'}: ${cleanText(opt.t)}`);
      });
    }
    parts.push(cleanText(item.fb));
  });

  return parts.join(' ');
}

function parseM7gDeck(html) {
  const match = html.match(/var\s+m7gRounds\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return [];
  }
}

function buildM7gNarration(deck) {
  if (!deck.length) {
    return 'Missão NR 12, Módulo 7. Cinco perguntas simples sobre a norma, os deveres do operador, os riscos, os dispositivos e as condutas.';
  }

  const parts = [
    'Missão NR 12, Módulo 7. Cinco perguntas simples sobre a norma, os deveres do operador, os riscos, os dispositivos e as condutas.',
  ];

  deck.forEach((item, index) => {
    parts.push(`Etapa ${index + 1}: ${cleanText(item.title)}. ${cleanText(item.inst)}`);
    if (item.type === 'order') {
      parts.push('Ordem correta:');
      item.items.forEach((opt, optIndex) => {
        parts.push(`Passo ${optIndex + 1}: ${cleanText(opt.t)}`);
      });
    } else if (item.type === 'select') {
      const yes = item.items.filter((opt) => opt.ok).map((opt) => cleanText(opt.t));
      const no = item.items.filter((opt) => !opt.ok).map((opt) => cleanText(opt.t));
      parts.push(`Marque: ${yes.join('; ')}.`);
      if (no.length) parts.push(`Não marque: ${no.join('; ')}.`);
    } else {
      item.items.forEach((opt) => {
        parts.push(`${opt.ok ? 'Regra correta' : 'Opção incorreta'}: ${cleanText(opt.t)}`);
      });
    }
    parts.push(cleanText(item.fb));
  });

  return parts.join(' ');
}
  const match = html.match(/const\s+qm4_data\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];
  try {
    return Function('"use strict"; return (' + match[1] + ');')();
  } catch {
    return [];
  }
}

function parseQm6Questions(html) {
  const match = html.match(/const\s+qm6_data\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) return [];
  try {
    return Function('"use strict"; return (' + match[1] + ');')();
  } catch {
    return [];
  }
}

function buildMod3Narration(deck) {
  if (!deck.length) {
    return 'Desafio do Módulo 3. Permitido ou Proibido. Decida se cada prática de procedimento operacional ou condução de transpaleteira pode ou não ser realizada. Conclua o jogo para validar o módulo.';
  }

  const parts = [
    'Desafio do Módulo 3. Permitido ou Proibido. Decida se cada prática de procedimento operacional ou condução de transpaleteira pode ou não ser realizada. Cinco situações sobre inspeção, trânsito interno, postura e estacionamento seguro.',
  ];

  deck.forEach((item, index) => {
    const answer = item.allowed ? 'Permitido' : 'Proibido';
    parts.push(`Situação ${index + 1}: ${cleanText(item.text)} Resposta correta: ${answer}. ${cleanText(item.tip)}`);
  });

  parts.push('Conclua o jogo para validar o módulo.');
  return parts.join(' ');
}

function buildQuizNarration(questions, moduleNum = 1) {
  if (!questions.length) {
    return `Quiz do Módulo ${moduleNum}. Responda às perguntas sobre os conceitos apresentados no módulo.`;
  }

  const parts = [
    `Quiz do Módulo ${moduleNum}. Responda às ${questions.length} perguntas sobre os conceitos do módulo.`,
  ];

  questions.forEach((item, index) => {
    parts.push(`Pergunta ${index + 1}: ${cleanText(item.q)}`);
    item.opts.forEach((opt, optIndex) => {
      parts.push(`Alternativa ${optIndex + 1}: ${cleanText(opt)}`);
    });
  });

  return parts.join(' ');
}

function slideTitle(slide) {
  const titleEl = slide.querySelector('.slide-title, .mod-intro-title, h1');
  return cleanText(titleEl?.textContent || slide.id);
}

function buildManifest(htmlPath = HTML_PATH) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const quizQuestions = parseQuizQuestions(html);
  const q5Questions = parseQ5Questions(html);
  const mod3Deck = parseMod3BinaryDeck(html);
    const mod1Deck = parseMod1GameDeck(html);
  const qm2Questions = parseQm2Questions(html);

  const slides = [...doc.querySelectorAll('#slides .slide')].map((slide, index) => {
    const id = slide.id || `slide-${index + 1}`;
    let text = NARRATION_OVERRIDES[id];

    if (text === null && id === 's7d') {
      text = buildQuizNarration(quizQuestions, 1);
    } else if (text === null && id === 's31') {
      text = buildQuizNarration(q5Questions, 5);
    } else if (text === null && id === 's26') {
      text = buildMod3Narration(mod3Deck);
    } else if (text === null && id === 's4f') {
      text = buildQuizNarration(parseQm4Questions(html), 4);
    } else if (text === null && id === 's6f') {
      text = buildQuizNarration(parseQm6Questions(html), 6);
    } else if (text === null && id === 's2e') {
      text = buildMod1Narration(mod1Deck);
    } else if (text === null && id === 's3f') {
      text = buildMod2Narration(qm2Questions);
    } else if ((text === undefined || text === null) && id === 's-mod2-game') {
      text = buildMod2tfNarration(parseMod2tfDeck(html));
    } else if ((text === undefined || text === null) && id === 's-mod3-game') {
      text = buildM3gNarration(parseM3gDeck(html));
    } else if ((text === undefined || text === null) && id === 's-mod4-game') {
      text = buildM4gNarration(parseM4gDeck(html));
    } else if ((text === undefined || text === null) && id === 's-mod5-game') {
      text = buildM5gNarration(parseM5gDeck(html));
    } else if ((text === undefined || text === null) && id === 's-mod6-game') {
      text = buildM6gNarration(parseM6gDeck(html));
    } else if ((text === undefined || text === null) && id === 's-mod7-game') {
      text = buildM7gNarration(parseM7gDeck(html));
    } else if (text === undefined || text === null) {
      text = extractSlideText(slide);
    }

    if (!text) {
      text = `Slide ${index + 1}. ${slideTitle(slide)}`;
    }

    return {
      index,
      id,
      title: slideTitle(slide),
      file: `audios/${id}.mp3`,
      text,
      audioReady: fs.existsSync(path.join(ROOT, 'audios', `${id}.mp3`)),
    };
  });

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: path.basename(htmlPath),
    audioDir: 'audios',
    slides,
  };
}

function writeManifest(manifest, outputPath = MANIFEST_PATH) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');

  const jsPath = path.join(path.dirname(outputPath), 'audio-manifest.js');
  fs.writeFileSync(
    jsPath,
    `window.__AUDIO_NARRATION__ = ${JSON.stringify(manifest)};\n`,
    'utf8',
  );

  return outputPath;
}

if (require.main === module) {
  const manifest = buildManifest();
  const out = writeManifest(manifest);
  console.log(`Manifesto gerado: ${out}`);
  console.log(`${manifest.slides.length} slides encontrados.`);
  manifest.slides.forEach((slide) => {
    console.log(`  [${String(slide.index + 1).padStart(2, '0')}] ${slide.id} (${slide.text.length} chars)`);
  });
}

module.exports = {
  HTML_PATH,
  MANIFEST_PATH,
  OUTPUT_DIR,
  NARRATION_OVERRIDES,
  buildManifest,
  writeManifest,
  extractSlideText,
  cleanText,
  buildMod1Narration,
  parseMod1GameDeck,
  buildMod2Narration,
  parseQm2Questions,
};
