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
    'Módulo de Treinamento. Segurança do Trabalho. NR 12 - Segurança na Operação de Máquinas. Treinamento de capacitação e reciclagem em segurança na operação de máquinas conforme a NR 12. São seis módulos, conteúdo completo, cento por cento online.',
  s2:
    'Apresentação. Bem-vindo ao Treinamento. NR 12. Assista ao vídeo de introdução à NR 11 e o nosso objetivo. Avance quando concluir.',
  s6:
    'Sumário. Conteúdo Programático. Módulo 1: Contexto Legal, Introdução e Fluxos do Sistema Automatizado. Módulo 2: Padrões Técnicos de Cargas e Triagem Visual de Pallets. Módulo 3: Componentes, Dispositivos de Segurança e Procedimento LOTO. Módulo 4: Fatores de Risco, Sensores e Cuidados com o Equipamento. Módulo 5: Instruções de Trabalho (IT), Passos Operacionais e EPIs. Módulo 6: Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT.',
  's-mod1':
    'Início do Módulo 1. Contexto Legal, Introdução e Fluxos do Sistema Automatizado.',
  s2b:
    'Vídeo. Responsabilidades Compartilhadas: A Empresa e Você. Contexto Legal, Introdução e Fluxos do Sistema Automatizado. Assista ao vídeo sobre as responsabilidades compartilhadas entre a empresa e você. Avance quando concluir.',
  s2b2:
    'Vídeo. Introdução ao Sistema Automatizado de Cajamar. Contexto Legal, Introdução e Fluxos do Sistema Automatizado. Assista ao vídeo de introdução ao sistema automatizado de Cajamar. Avance quando concluir.',
  s2b3:
    'Vídeo. A Rota do Pallet: Entrada, Saída e Picking. Contexto Legal, Introdução e Fluxos do Sistema Automatizado. Assista ao vídeo sobre a rota do pallet: entrada, saída e picking. Avance quando concluir.',
  s2d:
    'Dimensionamento e Capacidade Operacional. Este sistema automatizado suporta a alta demanda do CD Cajamar. O equipamento foi projetado sob medida e todos os fluxos foram dimensionados prevendo a pior condição de consolidação de dados da Leroy Merlin, operando de forma simultânea. São seis transelevadores para armazenagem automática de paletes, seis baias operacionais de picking mais uma baia dedicada a avarias, e dois carros duplos responsáveis pelos fluxos de entrada e saída. O fluxo de entrada suporta de 29 a 128 paletes por hora. O fluxo de saída varia de 5 a 132 paletes por hora, o que garante alta flexibilidade para atender qualquer pico de expedição com total segurança.',
  s2e: null, // montado a partir do deck do jogo Módulo 1
  's-mod2':
    'Início do Módulo 2. Padrões Técnicos de Cargas e Triagem Visual de Pallets.',
  's-mod2-video':
    'Vídeo. Limites de Carga. Padrões Técnicos de Cargas e Triagem Visual de Pallets. Assista ao vídeo sobre limites de carga. Avance quando concluir.',
  's-mod2-pallets':
    'Tipos de Pallet. O Pallet Escravo tem peso próprio de 50 quilos. O OneWay tipo A suporta até 1.950 quilos e é mais robusto, com tábuas de topo mais grossas e largas. O OneWay tipo B suporta até 950 quilos, com estrutura simplificada para cargas leves. Na simulação, o palete A é para alta resistência, cerca de 1.500 quilos, e o palete B para cargas leves, cerca de 500 quilos, em que o volume importa mais que o peso.',
  's-mod2-video2':
    'Vídeo. Pallet PBR: O Modelo de Automação. Padrões Técnicos de Cargas e Triagem Visual de Pallets. Assista ao vídeo sobre o pallet PBR, o modelo de automação. Avance quando concluir.',
  's-mod2-video-triagem':
    'Vídeo. Proibições Absolutas na Triagem. Padrões Técnicos de Cargas e Triagem Visual de Pallets. Assista ao vídeo sobre as proibições absolutas na triagem. Avance quando concluir.',
  's-mod2-triagem':
    'Defeitos Estruturais na Triagem. A triagem de pallets é etapa crítica. Pallets com defeitos estruturais não podem ser inseridos no sistema automatizado sob nenhuma circunstância. Toco quebrado: comprometimento da base de apoio causa instabilidade nos garfos dos transelevadores. Tábua quebrada ou irregular: superfície irregular impede assentamento correto da carga e aumenta risco de queda. Empenado ou espaçamento elevado: deformações estruturais causam travamento mecânico e parada não programada do sistema. Tábua superior irregular: superfície de apoio irregular compromete estabilidade da carga e pode causar desabamento. Risco principal: desabamento de cargas, instabilidade durante transporte automático e queda de produtos com risco de dano patrimonial e lesão a pessoas.',
  's-mod3':
    'Início do Módulo 3. Componentes, Dispositivos de Segurança e Procedimento LOTO.',
  's-mod3-video':
    'Vídeo. Velocidade Máxima e Consciência Situacional. Componentes, Dispositivos de Segurança e Procedimento LOTO. Assista ao vídeo sobre velocidade máxima e consciência situacional. Avance quando concluir.',
  's-mod3-video2':
    'Vídeo. Sinalização Luminosa e Visibilidade Ativa. Componentes, Dispositivos de Segurança e Procedimento LOTO. Assista ao vídeo sobre sinalização luminosa e visibilidade ativa. Avance quando concluir.',
  's-mod3-video3':
    'Vídeo. Cinto de Segurança e Ergonomia na Cabine. Componentes, Dispositivos de Segurança e Procedimento LOTO. Assista ao vídeo sobre o cinto de segurança e a ergonomia na cabine. Avance quando concluir.',
  's-mod3-driver-rules':
    'Regras de Trânsito Interno. Os motoristas e manobristas devem conduzir seus veículos de forma a proteger o pedestre. Velocidade máxima de vinte quilômetros por hora dentro da unidade. Pisca-alerta e faróis sempre ligados na circulação interna. Cinto obrigatório e somente condutor habilitado. Na faixa de pedestre, pare, olhe os dois lados e dê preferência ao pedestre, com contato visual. Proibido usar ou manusear celular ao dirigir. Nunca bloqueie áreas críticas: não pare sobre faixas, rampas ou em frente a equipamentos de emergência. Carga e descarga somente nas docas, em áreas sinalizadas. Na Red Zone, nunca pessoa e empilhadeira ao mesmo tempo. Parada segura do caminhão: desligado, freio estacionário acionado e trava-rodas. Se precisar descer, use a rota segura pela frente da doca e pelas faixas de pedestres.',
  's-mod3-video4':
    'Vídeo. Curvas, Cruzamentos e Sinalização Sonora. Componentes, Dispositivos de Segurança e Procedimento LOTO. Assista ao vídeo sobre curvas, cruzamentos e sinalização sonora. Avance quando concluir.',
  's-mod3-video5':
    'Vídeo. Subida, Descida e Estacionamento Preventivo. Componentes, Dispositivos de Segurança e Procedimento LOTO. Assista ao vídeo sobre subida, descida e estacionamento preventivo. Avance quando concluir.',
  's-mod3-video6':
    'Vídeo. Transporte de Cargas e Estabilidade Operacional. Componentes, Dispositivos de Segurança e Procedimento LOTO. Assista ao vídeo sobre transporte de cargas e estabilidade operacional. Avance quando concluir.',
  's-mod3-visibilidade':
    'Espelhos, Ré e Velocidade Máxima. Pessoas e operadores de empilhadeira, olhe sempre nos espelhos. Respeite a velocidade máxima: veículos, vinte quilômetros por hora; empilhadeiras, dez quilômetros por hora. Sempre que a empilhadeira estiver com materiais, o operador deve andar em ré.',
  's-mod3-game': null, // montado a partir do deck do jogo Módulo 3
  's-mod4':
    'Início do Módulo 4. Fatores de Risco, Sensores e Cuidados com o Equipamento.',
  's-mod4-video2':
    'Vídeo. A Regra de Ouro da Red Zone. Fatores de Risco, Sensores e Cuidados com o Equipamento. Assista ao vídeo sobre a regra de ouro da Red Zone. Avance quando concluir.',
  's-mod4-redzone':
    'Entendendo a Red Zone. As Red Zones, ou Zonas Vermelhas, são as áreas entre docas, destinadas ao acesso lateral para colocar ou retirar produtos. Esta regra é inegociável: na Red Zone nunca pode haver uma pessoa dentro da área ao mesmo tempo que uma empilhadeira em operação, seja entrando, manobrando, carregando ou saindo. O acesso à Red Zone é permitido apenas para o conferente, o motorista, para abrir e fechar a lona, e os amarradores.',
  's-mod4-video5':
    'Vídeo. Interação em Cruzamentos e Pontos Cegos. Fatores de Risco, Sensores e Cuidados com o Equipamento. Assista ao vídeo sobre interação em cruzamentos e pontos cegos. Avance quando concluir.',
  's-mod4-pontoscegos':
    'Proteja-se dos Pontos Cegos. Ponto cego é a área onde o operador pode não te ver. Pontos cegos da máquina: um, coluna traseira esquerda do protetor superior. Dois, estrutura superior, o teto de proteção, e coluna central. Três, parte superior do mastro e estrutura frontal. Quatro, região atrás do mastro e do porta-garfos. Cinco, coluna dianteira direita do protetor superior. Seis, coluna traseira direita do protetor superior, no lado do operador.',
  's-mod4-game': null, // montado a partir do deck do jogo Módulo 4
  's-mod5':
    'Início do Módulo 5. Instruções de Trabalho (IT), Passos Operacionais e EPIs.',
  's-mod5-picking':
    'Abastecimento do Picking. O processo de ressuprir, ou abastecer, o picking parece simples, mas se não for executado seguindo as regras, pode causar graves acidentes. Pessoas são prensadas entre paletes no momento do ressuprimento. Isto ocorre porque a visão do operador é obstruída por paletes, principalmente quando as pessoas estão abaixadas. No corredor de abastecimento, o operador avança com a empilhadeira em direção à célula de picking, onde pode haver um trabalhador abaixado e fora do campo de visão.',
  's-mod5-video-picking':
    'Vídeo. Protocolo de Aproximação Segura no Picking. Instruções de Trabalho (IT), Passos Operacionais e EPIs. Assista ao vídeo sobre o protocolo de aproximação segura no picking. Avance quando concluir.',
  's-mod5-aproximacao':
    'A Regra Inicial de Ouro. Nunca se aproxime de uma empilhadeira em movimento. Mantenha-se à distância segura de quatro metros e faça contato visual com o condutor para chamar sua atenção. O pedestre só pode se aproximar e iniciar a conversa após o operador realizar rigorosamente estes três passos. Passo 1: parada total do equipamento. A empilhadeira deve estar completamente estática. Passo 2: descida completa do garfo até o solo. Os garfos devem ser baixados e deitados planos contra o chão. Passo 3: desligamento do motor e retirada da chave. O motor deve ser desligado e a chave de ignição removida pelo operador.',
  's-mod5-doca':
    'Chaves, Motorista e Área Segura. Durante todo o processo de carregamento ou descarregamento na doca, um protocolo crítico deve ser seguido para que o veículo não saia antes da hora e ninguém entre na área de manobra. As chaves do caminhão nunca devem permanecer na ignição ou sob a posse do motorista. Elas devem ser recolhidas e mantidas sob a guarda da equipe de expedição. O motorista externo deve aguardar o fim da operação permanecendo de forma contínua dentro da área segura demarcada e protegida para pedestres. Ele é expressamente proibido de caminhar pela Red Zone ou pela baia operacional enquanto as empilhadeiras realizam as manobras de carga. Organização gera segurança.',
  's-mod5-video-garfos':
    'Vídeo. Riscos de Garfos Elevados e Movimentações Práticas. Instruções de Trabalho (IT), Passos Operacionais e EPIs. Assista ao vídeo sobre os riscos de dirigir com garfos elevados e as movimentações práticas. Avance quando concluir.',
  's-mod5-game': null, // montado a partir do deck do jogo Módulo 5
  's-mod6':
    'Início do Módulo 6. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT.',
  's-mod6-video':
    'Vídeo. O Pit Stop e as Regras de Entrada. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT. Assista ao vídeo sobre o pit stop e as regras de entrada. Avance quando concluir.',
  's-mod6-video2':
    'Vídeo. Proibições Críticas no Abastecimento. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT. Assista ao vídeo sobre as proibições críticas no abastecimento. Avance quando concluir.',
  's-mod6-guia':
    'Guia rápido de segurança do Pit Stop. Regras fundamentais para a baia de abastecimento de GLP e baterias. A área de abastecimento é uma das zonas de maior risco químico e de explosão do armazém. Três regras de acesso e operação. Primeira: permitido apenas um equipamento por vez dentro da baia. Aguarde a sua vez na fila recuada. Segunda: o operador deve apenas estacionar, desligar a máquina e puxar o freio. A troca do cilindro de GLP ou a conexão das baterias é de responsabilidade exclusiva do técnico abastecedor habilitado. Terceira: respeite os avisos de piso e mantenha as saídas do Pit Stop sempre totalmente livres. Fontes de ignição proibidas, tolerância zero. Proibido fumar ou portar qualquer chama exposta. Proibido manusear celulares ou qualquer dispositivo eletrônico ligado, pelo perigo de faíscas estáticas e distração.',
  's-mod6-video3':
    'Vídeo. Manobra de Abastecimento pelo Técnico. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT. Assista ao vídeo sobre a manobra de abastecimento pelo técnico. Avance quando concluir.',
  's-mod6-zonas':
    'Zoneamento de risco do armazém. Entenda onde cada máquina e pessoa deve circular. Para evitar colisões e atropelamentos, o armazém é dividido em três setores de fluxo. Conhecer e respeitar essas barreiras invisíveis é um dever de todos. Zona vermelha: movimentação de empilhadeira. Risco altíssimo de atropelamento e prensagem. Pedestres e ajudantes são proibidos nas ruas de estoque, salvo com bloqueio de segurança. Zona amarela: operações mistas. Risco médio, tráfego compartilhado controlado. Permitido apenas ajudantes com paleteiras e conferentes em auditoria de cargas. Zona verde: paleteiras e pedestres. Risco baixo. Empilhadeiras motorizadas são proibidas nestas vias.',
  's-mod6-video4':
    'Vídeo. Condições Adversas de Luz e Ofuscamento. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT. Assista ao vídeo sobre condições adversas de luz e ofuscamento. Avance quando concluir.',
  's-mod6-video5':
    'Vídeo. Comportamento e a Tolerância Zero a Brincadeiras. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT. Assista ao vídeo sobre comportamento e a tolerância zero a brincadeiras. Avance quando concluir.',
  's-mod6-video6':
    'Vídeo. Compromisso Coletivo e Encerramento. Empilhamento Ergonômico, Regras de Conduta e Recomendações SESMT. Assista ao vídeo de compromisso coletivo e encerramento. Avance quando concluir.',
  's-mod6-game': null, // montado a partir do deck do jogo Módulo 6
  's-fim':
    'Parabéns. Você concluiu o treinamento NR 12. Por mérito, dedicação e compromisso com a segurança, você percorreu os seis módulos e demonstrou responsabilidade com a sua vida e com a vida dos seus colegas. A segurança é um direito de todos e um dever de cada um. Continue fazendo a sua parte.',
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
    return 'Quiz NR 12 — Módulo 1. Contexto Legal, Introdução e Fluxos do Sistema Automatizado. Responda a quatro perguntas rápidas sobre os conceitos do módulo e valide seu aprendizado.';
  }

  const parts = [
    'Quiz NR 12 — Módulo 1. Contexto Legal, Introdução e Fluxos do Sistema Automatizado. Responda a quatro perguntas rápidas sobre os conceitos do módulo e valide seu aprendizado.',
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
    return 'Desafio Módulo 2 — Verdadeiro ou Falso. Padrões Técnicos de Cargas e Triagem Visual de Pallets. Responda quatro afirmações sobre limites de carga, Pallet PBR, proibições na triagem e defeitos estruturais.';
  }

  const parts = [
    'Desafio Módulo 2 — Verdadeiro ou Falso. Padrões Técnicos de Cargas e Triagem Visual de Pallets. Responda quatro afirmações sobre limites de carga, Pallet PBR, proibições na triagem e defeitos estruturais.',
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
    return 'Quiz NR-11 — Módulo 3. Você vai ler cinco situações reais de operação e escolher a atitude correta. Coloque em prática o que aprendeu sobre velocidade, sinalização, cinto de segurança, cruzamentos e embarque e desembarque.';
  }

  const letters = ['A', 'B', 'C'];
  const parts = [
    'Quiz NR-11 — Módulo 3. Você vai ler cinco situações reais de operação e escolher a atitude correta. Coloque em prática o que aprendeu sobre velocidade, sinalização, cinto de segurança, cruzamentos e embarque e desembarque.',
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
    return 'Quiz NR-11 — Módulo 4. Cinco afirmações rápidas sobre distância de segurança e a regra de ouro da Red Zone. Responda Certo ou Errado em cada uma.';
  }

  const parts = [
    'Quiz NR-11 — Módulo 4. Cinco afirmações rápidas sobre distância de segurança e a regra de ouro da Red Zone. Responda Certo ou Errado em cada uma.',
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
    return 'Quiz NR-11 — Módulo 5. Você vai responder cinco situações sobre picking, aproximação segura, conversa com o operador, docas e garfos elevados. Escolha a atitude correta.';
  }

  const letters = ['A', 'B', 'C'];
  const parts = [
    'Quiz NR-11 — Módulo 5. Você vai responder cinco situações sobre picking, aproximação segura, conversa com o operador, docas e garfos elevados. Escolha a atitude correta.',
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
    return 'Missão Pit Stop — Módulo 6. São três etapas práticas: acesso ao Pit Stop, proibições e ordem da manobra.';
  }

  const parts = [
    'Missão Pit Stop — Módulo 6. São três etapas práticas: acesso ao Pit Stop, proibições e ordem da manobra.',
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

function parseQm4Questions(html) {
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
