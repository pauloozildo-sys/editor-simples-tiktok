const imagemInput = document.getElementById('imagemInput'); 
const audioInput = document.getElementById('audioInput');
const textoInput = document.getElementById('textoInput');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

// ====== DECLARAÇÃO DE TODOS OS SELOS ======
const seloFCoracao = document.getElementById('seloFlutuanteCoracao');
const seloFTaca = document.getElementById('seloFlutuanteTaca');
const seloBeijo = document.getElementById('seloFlutuanteBeijo');
const seloCoracaoNovo = document.getElementById('seloFlutuanteCoracaoNovo');
const seloJesus = document.getElementById('seloFlutuanteJesus');
const seloTermometro = document.getElementById('seloFlutuanteTermometro');
const seloSol = document.getElementById('seloFlutuanteSol');

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
  if (item.el) item.el.crossOrigin = "anonymous";
});

// ====== CONTROLE DE POSIÇÕES DINÂMICAS PARA O CANVAS ======
window.posicoesSelos = {
  coracao: { x: 60, y: 60 },
  taca: { x: 1080 - 140 - 60, y: 60 },
  beijo: { x: 60, y: 220 },
  coracaoNovo: { x: 220, y: 220 },
  jesus: { x: 1080 - 140 - 60, y: 220 },
  termometro: { x: 60, y: 1350 - 140 - 60 },
  sol: { x: 1080 - 140 - 60, y: 1350 - 140 - 60 }
};

let estaExportando = false; 

// ====== EVENTOS DOS BOTÕES DOS SELOS ======
document.getElementById('btnFiltroCoracao').addEventListener('click', () => {
  toggleSelo(seloFCoracao, document.getElementById('btnFiltroCoracao'));
});

document.getElementById('btnFiltroTaca').addEventListener('click', () => {
  toggleSelo(seloFTaca, document.getElementById('btnFiltroTaca'));
});

function toggleSelo(elemento, botao) {
  if (!elemento) return;
  if (elemento.style.display === 'none' || elemento.style.display === '') {
    elemento.style.display = 'block';
    if(botao) botao.style.background = '#ff2d75';
  } else {
    elemento.style.display = 'none';
    if(botao) botao.style.background = '#333';
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
    document.querySelectorAll('.posBtn').forEach(b => b.style.background = '#333');
    btn.style.background = '#ff2d75';
    posicao = btn.dataset.pos;
    desenharPreview();
  });
});

// ---------- EVENTOS DE ALINHAMENTO ----------
document.querySelectorAll('.alignBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.alignBtn').forEach(b => b.style.background = '#333');
    btn.style.background = '#ff2d75';
    alinhamento = btn.dataset.align;
    desenharPreview();
  });
});

// ---------- EMOJIS ----------
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

  canvas.width = 1920;   
  canvas.height = 1080;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(videoAtual, 0, 0, canvas.width, canvas.height);

  const tamSelo = 140;

  function desenharSelo(elemento, nome) {
    if (!elemento || elemento.style.display !== 'block') return;
    
    // O grande truque: Quando exportar o vídeo, some com as tags HTML flutuantes da tela
    elemento.style.opacity = estaExportando ? "0" : "1";

    let x = window.posicoesSelos[nome].x;
    let y = window.posicoesSelos[nome].y;
    
    ctx.drawImage(elemento, x, y, tamSelo, tamSelo);
  }

  desenharSelo(seloFCoracao, 'coracao');
  desenharSelo(seloFTaca, 'taca');
  desenharSelo(seloBeijo, 'beijo');
  desenharSelo(seloCoracaoNovo, 'coracaoNovo');
  desenharSelo(seloJesus, 'jesus');
  desenharSelo(seloTermometro, 'termometro');
  desenharSelo(seloSol, 'sol');

  // DESENHA O TEXTO
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

// ---------- EXPORTAR VÍDEO ----------
document.getElementById('exportarBtn').addEventListener('click', async function(e) {
  e.preventDefault();
  
  const btn = this;
  const textoOriginal = btn.textContent;
  
  if (!videoAtual) { alert('🎬 Selecione o vídeo primeiro!'); return; }
  if (!audioURL) { alert('🎵 Selecione a música primeiro!'); return; }

  btn.textContent = '⏳ Preparando áudio...';
  btn.disabled = true;
  estaExportando = true; 

  try {
    const audioEl = new Audio(audioURL);
    audioEl.load();
    videoAtual.currentTime = 0;

    await new Promise(resolve => { audioEl.onloadedmetadata = resolve; });
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
    
    const combinedStream = new MediaStream([videoTrack, audioTrack]);
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 19000000 
    });
    
    let chunks = [];
    mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
    
    const forcarGravacaoFrames = setInterval(() => { desenharPreview(); }, 1000 / 30);
    
    mediaRecorder.onstop = () => {
      clearInterval(forcarGravacaoFrames);
      estaExportando = false; 
      desenharPreview();

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      const videoPreview = document.getElementById('videoPreview');
      videoPreview.src = url;
      videoPreview.style.display = 'block';
      videoPreview.load();
      videoPreview.play();
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'video-para-minha-mae.mp4';
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
    estaExportando = false;
    desenharPreview();
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
});

// =============================================
// FUNÇÃO DE ARRASTAR SINCRONIZADA COM O CANVAS
// =============================================
function fazerElementoArrastavel(elemento, nome) {
  let posInicialX = 0, posInicialY = 0;

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

    let deltaX = clienteX - posInicialX;
    let deltaY = clienteY - posInicialY;

    posInicialX = clienteX;
    posInicialY = clienteY;

    // 1. Move o elemento HTML visualmente na tela
    elemento.style.top = (elemento.offsetTop + deltaY) + "px";
    elemento.style.left = (elemento.offsetLeft + deltaX) + "px";
    
    // 2. Transforma o arrasto da tela para a escala real interna do Canvas (1080x1350)
    const rect = canvas.getBoundingClientRect();
    const fatorX = canvas.width / rect.width;
    const fatorY = canvas.height / rect.height;
    
    window.posicoesSelos[nome].x += deltaX * fatorX;
    window.posicoesSelos[nome].y += deltaY * fatorY;
    
    desenharPreview();
  }

  function pararArrasto() {
    document.removeEventListener('mousemove', arrastando);
    document.removeEventListener('mouseup', pararArrasto);
    document.removeEventListener('touchmove', arrastando);
    document.removeEventListener('touchend', pararArrasto);
  }
}

// Ativa o movimento fluído para cada um
todosOsSelos.forEach(item => {
  if (item.el) fazerElementoArrastavel(item.el, item.nome);
});

