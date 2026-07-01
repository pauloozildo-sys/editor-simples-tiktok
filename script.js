const imagemInput = document.getElementById('imagemInput'); 
const audioInput = document.getElementById('audioInput');
const textoInput = document.getElementById('textoInput');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

// ====== DECLARAÇÃO DE TODOS OS SELOS (No topo para não dar erro!) ======
const seloFCoracao = document.getElementById('seloFlutuanteCoracao');
const seloFTaca = document.getElementById('seloFlutuanteTaca');
const seloBeijo = document.getElementById('seloFlutuanteBeijo');
const seloCoracaoNovo = document.getElementById('seloFlutuanteCoracaoNovo');
const seloJesus = document.getElementById('seloFlutuanteJesus');
const seloTermometro = document.getElementById('seloFlutuanteTermometro');
const seloSol = document.getElementById('seloFlutuanteSol');

[seloFCoracao, seloFTaca, seloBeijo, seloCoracaoNovo, seloJesus, seloTermometro, seloSol].forEach(img => {
  img.crossOrigin = "anonymous";
});

// No início do script, depois de declarar os selos
window.posicoesSelos = {
  coracao: { x: 60, y: 60 },
  taca: { x: canvas.width - 140 - 60, y: 60 },
  beijo: { x: 60, y: 220 },
  coracaoNovo: { x: 220, y: 220 },
  jesus: { x: canvas.width - 140 - 60, y: 220 },
  termometro: { x: 60, y: canvas.height - 140 - 60 },
  sol: { x: canvas.width - 140 - 60, y: canvas.height - 140 - 60 }
};

// ====== EVENTOS DOS BOTÕES DOS SELOS ANTIGOS ======
document.getElementById('btnFiltroCoracao').addEventListener('click', () => {
  if (seloFCoracao.style.display === 'none' || seloFCoracao.style.display === '') {
    seloFCoracao.style.display = 'block';
  } else {
    seloFCoracao.style.display = 'none';
  }
  desenharPreview();
});

document.getElementById('btnFiltroTaca').addEventListener('click', () => {
  if (seloFTaca.style.display === 'none' || seloFTaca.style.display === '') {
    seloFTaca.style.display = 'block';
  } else {
    seloFTaca.style.display = 'none';
  }
  desenharPreview();
});

// ====== FUNÇÃO E EVENTOS DOS NOVOS SELOS ======
function toggleSelo(elemento, botao) {
  if (!elemento) return;
  if (elemento.style.display === 'none' || elemento.style.display === '') {
    elemento.style.display = 'block';
    if(botao) botao.style.border = '3px solid #ff2d75';
  } else {
    elemento.style.display = 'none';
    if(botao) botao.style.border = 'none';
  }
  desenharPreview();
}

if(document.getElementById('btnSeloBeijo')) {
  document.getElementById('btnSeloBeijo').addEventListener('click', function() { toggleSelo(seloBeijo, this); });
}
if(document.getElementById('btnSeloCoracaoNovo')) {
  document.getElementById('btnSeloCoracaoNovo').addEventListener('click', function() { toggleSelo(seloCoracaoNovo, this); });
}
if(document.getElementById('btnSeloJesus')) {
  document.getElementById('btnSeloJesus').addEventListener('click', function() { toggleSelo(seloJesus, this); });
}
if(document.getElementById('btnSeloTermometro')) {
  document.getElementById('btnSeloTermometro').addEventListener('click', function() { toggleSelo(seloTermometro, this); });
}
if(document.getElementById('btnSeloSol')) {
  document.getElementById('btnSeloSol').addEventListener('click', function() { toggleSelo(seloSol, this); });
}

let videoAtual = null; 
let audioURL = null;
let loopPreview = null;

let posicao = 'center';
let alinhamento = 'center';

// ---------- EVENTOS DAS POSIÇÕES ----------
document.querySelectorAll('.posBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.posBtn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    posicao = btn.dataset.pos;
    desenharPreview();
  });
});

// ---------- EVENTOS DE ALINHAMENTO ----------
document.querySelectorAll('.alignBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.alignBtn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    alinhamento = btn.dataset.align;
    desenharPreview();
  });
});

// ---------- EMOJIS (insere no campo de texto) ----------
document.querySelectorAll('.emojiBtn').forEach(emoji => {
  emoji.addEventListener('click', () => {
    const cursorPos = textoInput.selectionStart;
    const text = textoInput.value;
    const antes = text.substring(0, cursorPos);
    const depois = text.substring(cursorPos);
    textoInput.value = antes + emoji.textContent + depois;
    textoInput.focus();
    const novaPos = cursorPos + emoji.textContent.length;
    textoInput.setSelectionRange(novaPos, novaPos);
    desenharPreview();
  });
});

// ---------- UPLOAD DE VÍDEO ----------
imagemInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const video = document.createElement('video');
  video.crossOrigin = "anonymous";
  video.src = URL.createObjectURL(file);
  video.muted = true; 
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;

  video.load();
  video.onloadedmetadata = () => {
    videoAtual = video;
    video.play().then(() => {
      if (loopPreview) cancelAnimationFrame(loopPreview);
      atualizarCanvasLoop(); 
    });
  };
});

function atualizarCanvasLoop() {
  if (!videoAtual) return;
  desenharPreview();
  loopPreview = requestAnimationFrame(atualizarCanvasLoop);
}

audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) audioURL = URL.createObjectURL(file);
});

textoInput.addEventListener('input', desenharPreview);

// ---------- FUNÇÃO PRINCIPAL: DESENHAR ----------
function desenharPreview() {
  if (!videoAtual) return; 

  canvas.width = 1080;   // Mantive o padrão original estável para Reels/TikTok
  canvas.height = 1350;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.drawImage(videoAtual, 0, 0, canvas.width, canvas.height);

  // Carimbo dos Selos Antigos
  // ---------- CARIMBAR SELOS COM POSIÇÃO DINÂMICA ----------
  const tamSelo = 140;

  // Função auxiliar para desenhar selo na posição salva ou padrão
  function desenharSelo(elemento, nome, xPadrao, yPadrao) {
    if (!elemento || elemento.style.display !== 'block') return;
    
    let x = xPadrao;
    let y = yPadrao;
    
    // Se o usuário já moveu, usa a posição salva
    if (window.posicoesSelos && window.posicoesSelos[nome]) {
      x = window.posicoesSelos[nome].x;
      y = window.posicoesSelos[nome].y;
    }
    
    ctx.drawImage(elemento, x, y, tamSelo, tamSelo);
  }

  // Desenha cada selo com sua posição dinâmica
  desenharSelo(seloFCoracao, 'coracao', 60, 60);
  desenharSelo(seloFTaca, 'taca', canvas.width - tamSelo - 60, 60);
  desenharSelo(seloBeijo, 'beijo', 60, 220);
  desenharSelo(seloCoracaoNovo, 'coracaoNovo', 220, 220);
  desenharSelo(seloJesus, 'jesus', canvas.width - tamSelo - 60, 220);
  desenharSelo(seloTermometro, 'termometro', 60, canvas.height - tamSelo - 60);
  desenharSelo(seloSol, 'sol', canvas.width - tamSelo - 60, canvas.height - tamSelo - 60);

  // 3. DESENHA O TEXTO
  const texto = textoInput.value || 'VOCÊ VAI AMAR ISSO';
  ctx.textAlign = alinhamento;
  ctx.textBaseline = 'middle';

  let x, y;
  const margin = 120; 

  switch (posicao) {
    case 'top': y = margin; break;
    case 'center': y = canvas.height / 2; break;
    case 'bottom': y = canvas.height - margin; break;
    case 'corner': y = canvas.height - margin; x = canvas.width - margin; break;
    default: y = canvas.height / 2;
  }

  if (posicao === 'corner') {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
  } else {
    ctx.textAlign = alinhamento;
    ctx.textBaseline = 'middle';
    if (alinhamento === 'left') x = margin;
    else if (alinhamento === 'right') x = canvas.width - margin;
    else x = canvas.width / 2;
  }

  ctx.font = 'bold 85px Arial';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 12;
  ctx.strokeText(texto, x, y);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'white';
  ctx.fillText(texto, x, y);
}

// ---------- EXPORTAR VÍDEO (VERSÃO FINAL DINÂMICA) ----------
document.getElementById('exportarBtn').addEventListener('click', async function(e) {
  e.preventDefault();
  
  const btn = this;
  const textoOriginal = btn.textContent;
  
  if (!videoAtual) {
    alert('🎬 Selecione o vídeo da sua mãe primeiro!');
    return;
  }
  if (!audioURL) {
    alert('🎵 Selecione a música dela primeiro!');
    return;
  }

  btn.textContent = '⏳ Preparando áudio...';
  btn.disabled = true;

  try {
    const audioEl = new Audio(audioURL);
    audioEl.load();
    
    videoAtual.currentTime = 0;

    await new Promise(resolve => {
      audioEl.onloadedmetadata = resolve;
    });
    
    const duracaoSegundos = audioEl.duration; 
    
    btn.textContent = `⏳ Processando vídeo... (${Math.round(duracaoSegundos)}s)`;
    
    const canvasStream = canvas.captureStream(30);
    
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioEl);
    const destination = audioCtx.createMediaStreamDestination();
    source.connect(destination);
    source.connect(audioCtx.destination);
    
    const videoTrack = canvasStream.getVideoTracks()[0];
    const audioTrack = destination.stream.getAudioTracks()[0];
    
    if (!videoTrack || !audioTrack) {
      throw new Error('Track de vídeo ou áudio não encontrada!');
    }
    
    const combinedStream = new MediaStream([videoTrack, audioTrack]);
    
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 8000000 
    });
    
    let chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    
    const forcarGravacaoFrames = setInterval(() => {
      desenharPreview();
    }, 1000 / 30);
    
    mediaRecorder.onstop = () => {
      clearInterval(forcarGravacaoFrames);

      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      const videoPreview = document.getElementById('videoPreview');
      videoPreview.src = url;
      videoPreview.style.display = 'block';
      videoPreview.load();
      videoPreview.play();
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'video-para-minha-mae.webm';
      link.click();
      
      btn.textContent = textoOriginal;
      btn.disabled = false;
    };
    
    mediaRecorder.start();
    await audioEl.play();
    
    setTimeout(() => {
      mediaRecorder.stop();
      audioEl.pause();
      audioEl.currentTime = 0;
    }, duracaoSegundos * 1000 + 300);
    
  } catch (error) {
    console.error('Erro:', error);
    alert('❌ Erro ao gerar vídeo: ' + error.message);
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
});

// =============================================
// ASSISTENTE IA (CHATGPT)
// =============================================

const comandoInput = document.getElementById('comandoIA');
const btnIA = document.getElementById('btnIA');
const statusIA = document.getElementById('statusIA');

function executarAcaoIA(acao) {
  switch (acao.acao) {
    case 'texto':
      textoInput.value = acao.conteudo;
      desenharPreview();
      break;

    case 'posicao':
      const posBtn = document.querySelector(`.posBtn[data-pos="${acao.valor}"]`);
      if (posBtn) posBtn.click();
      break;

    case 'alinhamento':
      const alinBtn = document.querySelector(`.alignBtn[data-align="${acao.valor}"]`);
      if (alinBtn) alinBtn.click();
      break;

    case 'selo':
      const btnSelo = acao.qual === 'coracao' 
        ? document.getElementById('btnFiltroCoracao')
        : document.getElementById('btnFiltroTaca');
      
      const seloImg = acao.qual === 'coracao' 
        ? document.getElementById('seloFlutuanteCoracao')
        : document.getElementById('seloFlutuanteTaca');
      
      const estaAtivo = seloImg && seloImg.style.display === 'block';
      if ((acao.estado === 'ativar' && !estaAtivo) || 
          (acao.estado === 'desativar' && estaAtivo)) {
        if (btnSelo) btnSelo.click();
      }
      break;
  }
}

async function chamarIA(comando) {
  const CHAVE_API = 'SUA_CHAVE_AQUI'; 

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHAVE_API}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de edição de vídeos. 
            O usuário vai pedir algo e você deve retornar APENAS UM JSON com as ações necessárias.
            As ações possíveis são:
            - {"acao": "texto", "conteudo": "..."}
            - {"acao": "posicao", "valor": "topo" ou "centro" ou "base" ou "canto"}
            - {"acao": "alinhamento", "valor": "esquerda" ou "centro" ou "direita"}
            - {"acao": "selo", "qual": "coracao" ou "taca", "estado": "ativar" ou "desativar"}
            
            Exemplo: se o usuário pedir "coloca a taça no canto com um texto motivacional", você retorna:
            [{"acao":"posicao","valor":"canto"},{"acao":"selo","qual":"taca","estado":"ativar"},{"acao":"texto","conteudo":"VOCÊ É MINHA TAÇA 🏆"}]
            Retorne APENAS o JSON, sem explicações.`
          },
          { role: 'user', content: comando }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const conteudo = data.choices[0].message.content;
    
    try {
      const acoes = JSON.parse(conteudo);
      return Array.isArray(acoes) ? acoes : [acoes];
    } catch {
      const match = conteudo.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
      throw new Error('Resposta da IA não é um JSON válido');
    }
  } catch (error) {
    console.error('Erro na IA:', error);
    statusIA.textContent = '❌ Erro ao chamar IA. Verifique sua chave ou conexão.';
    return null;
  }
}

btnIA.addEventListener('click', async () => {
  const comando = comandoInput.value.trim();
  if (!comando) {
    statusIA.textContent = '⚠️ Digite um comando primeiro!';
    return;
  }

  btnIA.disabled = true;
  btnIA.textContent = '⏳ Pensando...';
  statusIA.textContent = '🤖 IA está processando seu pedido...';

  const acoes = await chamarIA(comando);

  if (acoes && acoes.length > 0) {
    statusIA.textContent = '✅ IA executou ' + acoes.length + ' ação(ões)!';
    
    for (let i = 0; i < acoes.length; i++) {
      setTimeout(() => {
        executarAcaoIA(acoes[i]);
      }, i * 300); 
    }
  } else {
    statusIA.textContent = '❌ Não foi possível processar o comando. Tente de novo.';
  }

  btnIA.disabled = false;
  btnIA.textContent = '✨ IA';
});

comandoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnIA.click();
});

// =============================================
// FUNÇÃO MÁGICA: TORNAR QUALQUER SELO ARRASTÁVEL (COM CANVAS)
// =============================================
function fazerElementoArrastavel(elemento, nome) {
  let posInicialX = 0, posInicialY = 0;
  let posAtualX = 0, posAtualY = 0;

  elemento.addEventListener('mousedown', iniciarArrasto);
  elemento.addEventListener('touchstart', iniciarArrasto, { passive: false });

  function iniciarArrasto(e) {
    e.preventDefault();
    
    if (e.type === 'touchstart') {
      posInicialX = e.touches[0].clientX;
      posInicialY = e.touches[0].clientY;
    } else {
      posInicialX = e.clientX;
      posInicialY = e.clientY;
    }
    
    document.addEventListener('mousemove', arrastando);
    document.addEventListener('mouseup', pararArrasto);
    document.addEventListener('touchmove', arrastando, { passive: false });
    document.addEventListener('touchend', pararArrasto);
  }

  function arrastando(e) {
    e.preventDefault();
    
    let clienteX, clienteY;
    if (e.type === 'touchmove') {
      clienteX = e.touches[0].clientX;
      clienteY = e.touches[0].clientY;
    } else {
      clienteX = e.clientX;
      clienteY = e.clientY;
    }

    posAtualX = posInicialX - clienteX;
    posAtualY = posInicialY - clienteY;
    posInicialX = clienteX;
    posInicialY = clienteY;

    elemento.style.top = (elemento.offsetTop - posAtualY) + "px";
    elemento.style.left = (elemento.offsetLeft - posAtualX) + "px";
    
    if (!window.posicoesSelos) window.posicoesSelos = {};
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (elemento.offsetLeft - rect.left) * scaleX;
    const canvasY = (elemento.offsetTop - rect.top) * scaleY;
    
    window.posicoesSelos[nome] = { x: canvasX, y: canvasY };
    
    desenharPreview();
  }

  function pararArrasto() {
    document.removeEventListener('mousemove', arrastando);
    document.removeEventListener('mouseup', pararArrasto);
    document.removeEventListener('touchmove', arrastando);
    document.removeEventListener('touchend', pararArrasto);
  }
}

// ====== APLICAR O ARRASTO EM TODOS OS SEUS SELOS ======
const todosOsSelos = [
  { el: seloFCoracao, nome: 'coracao' },
  { el: seloFTaca, nome: 'taca' },
  { el: seloBeijo, nome: 'beijo' },
  { el: seloCoracaoNovo, nome: 'coracaoNovo' },
  { el: seloJesus, nome: 'jesus' },
  { el: seloTermometro, nome: 'termometro' },
  { el: seloSol, nome: 'sol' }
];

todosOsSelos.forEach(item => {
  if (item.el) fazerElementoArrastavel(item.el, item.nome);
});
