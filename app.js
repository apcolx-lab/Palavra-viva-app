import {
  saveLastPosition,
  getLastPosition,
  requestStoragePersistence,
  getStorageEstimate,
  exportUserDataJson,
  importUserDataJson,
  clearAllPv4Storage
} from './storage.js';

let manifestData = null;
let currentFontSizeIndex = 0;
const fontSizes = ['16px', '18px', '22px'];

export async function computeSha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function syncAndCleanCache(newManifest) {
  if (typeof caches === 'undefined') return;
  const currentGen = parseInt(localStorage.getItem('pv4-manifest-generation') || '0', 10);

  if (newManifest.generation > currentGen) {
    const dataCache = await caches.open('pv4-data-v1');
    const cachedRequests = await dataCache.keys();

    const activePaths = new Set(newManifest.packages.map(p => p.path));
    const revokedSet = new Set(newManifest.revoked || []);

    for (const req of cachedRequests) {
      const url = new URL(req.url);
      const relativePath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

      const isRevoked = Array.from(revokedSet).some(r => relativePath.includes(r));
      const isUnlisted = !Array.from(activePaths).some(p => relativePath.endsWith(p));

      if (isRevoked || isUnlisted) {
        await dataCache.delete(req);
        console.log(`Purged cached package: ${relativePath}`);
      }
    }

    localStorage.setItem('pv4-manifest-generation', newManifest.generation.toString());
  }
}

export async function fetchVerifiedPackage(pkg) {
  const cache = typeof caches !== 'undefined' ? await caches.open('pv4-data-v1') : null;
  const reqUrl = './' + pkg.path;

  try {
    const res = await fetch(reqUrl);
    if (res.ok) {
      const text = await res.text();
      const realHash = await computeSha256(text);

      if (realHash.toLowerCase() === pkg.hash.toLowerCase()) {
        const data = JSON.parse(text);
        if (cache) {
          const responseToCache = new Response(text, {
            headers: { 'Content-Type': 'application/json' }
          });
          await cache.put(reqUrl, responseToCache);
        }
        return data;
      } else {
        console.error(`SHA-256 mismatch for ${pkg.path}. Expected: ${pkg.hash}, Got: ${realHash}`);
      }
    }
  } catch (err) {
    console.warn(`Network fetch failed for ${pkg.path}: ${err.message}`);
  }

  // Fallback to cached version if network fails or hash fails
  if (cache) {
    const cachedRes = await cache.match(reqUrl);
    if (cachedRes) {
      const cachedText = await cachedRes.text();
      const cachedHash = await computeSha256(cachedText);
      if (cachedHash.toLowerCase() === pkg.hash.toLowerCase()) {
        return JSON.parse(cachedText);
      }
    }
  }

  throw new Error(`Pacote ${pkg.id} não pôde ser verificado ou carregado.`);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    setupTheme();
    setupFontSize();
    setupStorageUI();
    await setupServiceWorker();
    await requestStoragePersistence();

    await loadManifest();
    await initApp();
  });
}

function setupTheme() {
  const btnTheme = document.getElementById('btn-theme');
  const savedTheme = localStorage.getItem('pv4-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  btnTheme.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pv4-theme', newTheme);
  });
}

function setupFontSize() {
  const btnFont = document.getElementById('btn-font');
  const savedSizeIndex = parseInt(localStorage.getItem('pv4-font-index') || '1', 10);
  currentFontSizeIndex = savedSizeIndex >= 0 && savedSizeIndex < fontSizes.length ? savedSizeIndex : 1;
  document.documentElement.style.setProperty('--font-size', fontSizes[currentFontSizeIndex]);

  btnFont.addEventListener('click', () => {
    currentFontSizeIndex = (currentFontSizeIndex + 1) % fontSizes.length;
    document.documentElement.style.setProperty('--font-size', fontSizes[currentFontSizeIndex]);
    localStorage.setItem('pv4-font-index', currentFontSizeIndex.toString());
  });
}

function setupStorageUI() {
  const btnReset = document.getElementById('btn-reset');
  btnReset.addEventListener('click', async () => {
    if (confirm('Deseja realmente limpar todo o cache e dados locais do Palavra Viva?')) {
      await clearAllPv4Storage();
      localStorage.clear();
      window.location.reload();
    }
  });

  const btnExport = document.getElementById('btn-export-backup');
  btnExport.addEventListener('click', async () => {
    const jsonStr = await exportUserDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palavra-viva-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const btnImport = document.getElementById('btn-import-backup');
  const fileInput = document.getElementById('file-backup-input');
  btnImport.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        await importUserDataJson(text);
        alert('Backup importado com sucesso!');
        window.location.reload();
      } catch (err) {
        alert('Erro ao importar backup: ' + err.message);
      }
    }
  });

  updateStorageEstimate();
}

async function updateStorageEstimate() {
  const estimate = await getStorageEstimate();
  const estimateEl = document.getElementById('storage-estimate');
  if (estimate && estimateEl) {
    estimateEl.textContent = `Uso de armazenamento local: ${estimate.usageInMB} MB / ${estimate.quotaInMB} MB`;
  }
}

async function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner(newWorker);
            }
          });
        }
      });
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  }
}

function showUpdateBanner(worker) {
  const banner = document.getElementById('update-banner');
  const btnUpdate = document.getElementById('btn-update');
  banner.style.display = 'flex';

  btnUpdate.addEventListener('click', () => {
    worker.postMessage({ action: 'SKIP_WAITING' });
    window.location.reload();
  });
}

async function loadManifest() {
  try {
    const response = await fetch('./content-manifest.json', { cache: 'no-store' });
    if (response.ok) {
      manifestData = await response.json();
      if (manifestData.licenseAttribution) {
        const attrEl = document.getElementById('license-attribution');
        if (attrEl) attrEl.textContent = manifestData.licenseAttribution;
      }
      await syncAndCleanCache(manifestData);
    }
  } catch (err) {
    console.warn('Could not fetch content manifest:', err);
  }
}

async function initApp() {
  const lastPos = await getLastPosition();
  if (lastPos && lastPos.bookId && lastPos.chapter) {
    renderChapter(lastPos.bookId, lastPos.chapter);
  } else {
    renderBookList();
  }
}

function renderBookList() {
  const container = document.getElementById('reader-view');
  const navBar = document.getElementById('nav-bar');
  navBar.style.display = 'none';

  const bibliaPkgs = manifestData ? manifestData.packages.filter(p => p.type === 'biblia') : [];

  let html = '<h2>Livros da Bíblia</h2>';
  if (bibliaPkgs.length === 0) {
    html += '<p>Nenhum livro disponível no momento.</p>';
  } else {
    html += '<div class="book-grid">';
    for (const pkg of bibliaPkgs) {
      const parts = pkg.id.split('-');
      const bookId = parts[1];
      const chapter = parseInt(parts[2], 10);

      html += `
        <div class="book-card" data-book="${bookId}" data-chapter="${chapter}">
          <strong>João</strong>
          <div>Capítulo ${chapter}</div>
        </div>
      `;
    }
    html += '</div>';
  }

  container.innerHTML = html;

  container.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', () => {
      const bookId = card.getAttribute('data-book');
      const chapter = card.getAttribute('data-chapter');
      renderChapter(bookId, chapter);
    });
  });
}

async function renderChapter(bookId, chapter) {
  const container = document.getElementById('reader-view');
  const navBar = document.getElementById('nav-bar');
  const navTitle = document.getElementById('nav-title');
  const btnBack = document.getElementById('btn-back');

  navBar.style.display = 'block';
  navTitle.textContent = `João ${chapter}`;

  btnBack.onclick = () => renderBookList();

  const pkgId = `biblia-${bookId}-${String(chapter).padStart(3, '0')}`;
  const pkg = manifestData ? manifestData.packages.find(p => p.id === pkgId) : null;

  if (!pkg) {
    container.innerHTML = '<p>Capítulo não encontrado no manifesto de conteúdo.</p>';
    return;
  }

  try {
    const data = await fetchVerifiedPackage(pkg);

    let html = `<h2>${data.bookName} ${data.chapter}</h2>`;
    html += '<div class="verses-list">';
    for (const v of data.verses) {
      html += `
        <div class="verse-item">
          <span class="verse-num">${v.verse}</span>
          <span class="verse-text">${v.text}</span>
        </div>
      `;
    }
    html += '</div>';

    // Layer 2 passage if available
    const pkgCamada2 = manifestData.packages.find(p => p.type === 'camada2-passagem' && p.id.startsWith(`${bookId}-${String(chapter).padStart(3, '0')}`));
    if (pkgCamada2) {
      try {
        const dataC2 = await fetchVerifiedPackage(pkgCamada2);
        html += `
          <div class="teaching-box" style="margin-top: 24px; padding: 16px; background-color: var(--card-bg); border-radius: 8px;">
            <h3>Ensino do App</h3>
            <p><strong>Ensino do app, não é a Bíblia. Gerado por IA e conferido por outras IAs.</strong></p>
            ${dataC2.humanReviewed ? '<p><small>✓ Revisado por pessoa</small></p>' : ''}
            <p><strong>Pergunta de abertura:</strong> ${dataC2.openingQuestion}</p>
            <p><strong>O que o texto diz:</strong> ${dataC2.whatTextSays}</p>
            <p><strong>Como este texto se liga ao evangelho:</strong> ${dataC2.gospelConnection}</p>
            <p><strong>Aplicação:</strong> ${dataC2.application}</p>
            <p><strong>Oração:</strong> ${dataC2.prayer}</p>
          </div>
        `;
      } catch (errC2) {
        console.warn('Could not load Layer 2 package:', errC2);
      }
    }

    container.innerHTML = html;
    await saveLastPosition(bookId, chapter);
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar o capítulo: ${err.message}</p>`;
  }
}
