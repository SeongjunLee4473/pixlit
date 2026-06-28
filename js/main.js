/* =============================================
   Pixlit — main.js
   ============================================= */

'use strict';

/* ---------- State ---------- */
const state = {
  heic:     { files: [], results: [] },
  compress: { files: [], results: [] },
  lang: 'ko'
};

/* ---------- Tab switching ---------- */
function switchTab(tab) {
  ['heic', 'compress'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).setAttribute('aria-selected', t === tab);
    document.getElementById('body-' + t).classList.toggle('active', t === tab);
  });
}

/* ---------- Slider ---------- */
function updateSlider(inputId, valId) {
  const val = document.getElementById(inputId).value;
  document.getElementById(valId).textContent = val + '%';
  updateSliderTrack(inputId, val);
}

function updateSliderTrack(inputId, val) {
  const el = document.getElementById(inputId);
  el.style.background = `linear-gradient(to right, #2563EB ${val}%, #CBD5E1 ${val}%)`;
}

/* ---------- Toggle switch ---------- */
function toggleSwitch(id) {
  document.getElementById(id).classList.toggle('on');
}

/* ---------- Drag & Drop ---------- */
function handleDragOver(e, zoneId) {
  e.preventDefault();
  document.getElementById(zoneId).classList.add('drag-over');
}

function handleDragLeave(e, zoneId) {
  document.getElementById(zoneId).classList.remove('drag-over');
}

function handleDrop(e, type) {
  e.preventDefault();
  const zoneId = type + '-drop';
  document.getElementById(zoneId).classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  processFiles(files, type);
}

/* ---------- File select ---------- */
function handleFileSelect(e, type) {
  const files = Array.from(e.target.files);
  processFiles(files, type);
  e.target.value = '';
}

function processFiles(files, type) {
  const validExts = type === 'heic'
    ? ['heic', 'heif']
    : ['png', 'jpg', 'jpeg', 'webp'];

  const filtered = files.filter(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    return validExts.includes(ext);
  });

  if (!filtered.length) {
    showToast(state.lang === 'ko' ? '지원하지 않는 파일 형식입니다.' : 'Unsupported file format.');
    return;
  }

  state[type].files = filtered;
  state[type].results = [];
  renderFileList(type);
  updateBatchIndicator(type);
  updateButtons(type, false);
  updatePreviewPlaceholder(type);
}

/* ---------- File list ---------- */
function renderFileList(type) {
  const list = document.getElementById(type + '-file-list');
  list.innerHTML = '';
  list.classList.toggle('visible', state[type].files.length > 1);

  if (state[type].files.length <= 1) return;

  state[type].files.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = type + '-file-' + i;
    item.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#94A3B8" stroke-width="1.4"><rect x="2" y="1" width="9" height="12" rx="1.5"/><path d="M4 4.5h5M4 7h5M4 9.5h3"/></svg>
      <span class="file-item-name">${escHtml(f.name)}</span>
      <span class="file-item-size">${formatSize(f.size)}</span>
      <span class="file-item-status" id="${type}-status-${i}">—</span>
      <button class="file-remove" onclick="removeFile('${type}',${i})" aria-label="파일 제거">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2l9 9M11 2l-9 9"/></svg>
      </button>
    `;
    list.appendChild(item);
  });
}

function removeFile(type, idx) {
  state[type].files.splice(idx, 1);
  state[type].results = [];
  if (!state[type].files.length) {
    resetTool(type);
  } else {
    renderFileList(type);
    updateBatchIndicator(type);
    updateButtons(type, false);
  }
}

function resetTool(type) {
  state[type].files = [];
  state[type].results = [];
  document.getElementById(type + '-batch').classList.remove('visible');
  document.getElementById(type + '-file-list').classList.remove('visible');
  document.getElementById(type + '-file-list').innerHTML = '';
  document.getElementById(type + '-progress').classList.remove('visible');
  updateButtons(type, false);
  updatePreviewPlaceholder(type);
}

/* ---------- Batch indicator ---------- */
function updateBatchIndicator(type) {
  const n = state[type].files.length;
  const ind = document.getElementById(type + '-batch');
  const txt = document.getElementById(type + '-batch-text');
  ind.classList.toggle('visible', n > 0);
  if (n === 1) {
    txt.textContent = state.lang === 'ko'
      ? `${state[type].files[0].name} 선택됨`
      : `${state[type].files[0].name} selected`;
  } else {
    txt.textContent = state.lang === 'ko'
      ? `${n}개 파일 선택됨 — 배치 모드`
      : `${n} files selected — batch mode`;
  }
  updateButtons(type, false);
}

/* ---------- Buttons ---------- */
function updateButtons(type, done) {
  const hasFiles = state[type].files.length > 0;
  const btnId = type === 'heic' ? 'heic-convert-btn' : 'compress-btn';
  document.getElementById(btnId).disabled = !hasFiles;
  document.getElementById(type + '-individual-btn').disabled = !done;
}

/* ---------- Preview ---------- */
function updatePreviewPlaceholder(type) {
  const f = state[type].files[0];
  const beforeSize = document.getElementById(type + '-before-size');
  const badge = document.getElementById(type + '-save-badge');
  const afterSize = document.getElementById(type + '-after-size');

  // 변환 후 썸네일 초기화
  const afterThumb = document.getElementById(type + '-after-thumb');
  afterThumb.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="3" fill="#34D399" opacity="0.4"/><circle cx="12" cy="13" r="3" fill="#34D399"/><path d="M4 22l8-6 5 4 4-3 7 5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  afterThumb.className = 'preview-thumb placeholder-after';

  if (!f) {
    beforeSize.textContent = '—';
    afterSize.textContent = '—';
    badge.style.display = 'none';
    // 변환 전 썸네일도 초기화
    const beforeThumb = document.getElementById(type + '-before-thumb');
    beforeThumb.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="3" fill="#818CF8" opacity="0.4"/><circle cx="12" cy="13" r="3" fill="#818CF8"/><path d="M4 22l8-6 5 4 4-3 7 5" stroke="#818CF8" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    beforeThumb.className = 'preview-thumb placeholder-before';
    return;
  }

  beforeSize.textContent = formatSize(f.size);
  afterSize.textContent = '—';
  badge.style.display = 'none';

  if (type === 'compress') {
    const ext = f.name.split('.').pop().toUpperCase();
    document.getElementById('compress-before-fmt').textContent = '.' + ext;
  }

  const thumb = document.getElementById(type + '-before-thumb');

  if (type === 'heic') {
    // HEIC는 브라우저가 직접 렌더링하지 못하므로 heic2any로 썸네일 변환 후 표시
    thumb.innerHTML = `<span style="font-size:12px;color:#94A3B8">${state.lang === 'ko' ? '미리보기 생성 중...' : 'Generating preview...'}</span>`;
    thumb.className = 'preview-thumb placeholder-before';
    heic2any({ blob: f, toType: 'image/jpeg', quality: 0.3 })
      .then(result => {
        const previewBlob = Array.isArray(result) ? result[0] : result;
        const url = URL.createObjectURL(previewBlob);
        thumb.innerHTML = `<img src="${url}" alt="preview">`;
        thumb.className = 'preview-thumb';
      })
      .catch(() => {
        // 미리보기 실패 시 아이콘 fallback
        thumb.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="3" fill="#818CF8" opacity="0.4"/><circle cx="12" cy="13" r="3" fill="#818CF8"/><path d="M4 22l8-6 5 4 4-3 7 5" stroke="#818CF8" stroke-width="1.5" stroke-linecap="round"/></svg>`;
        thumb.className = 'preview-thumb placeholder-before';
      });
  } else {
    // PNG/JPG/WEBP는 브라우저가 직접 렌더링 가능
    const url = URL.createObjectURL(f);
    thumb.innerHTML = `<img src="${url}" alt="preview">`;
    thumb.className = 'preview-thumb';
  }
}

function updateAfterPreview(type, resultBlob, savedPct) {
  const afterThumb = document.getElementById(type + '-after-thumb');
  const afterSize  = document.getElementById(type + '-after-size');
  const badge      = document.getElementById(type + '-save-badge');

  // 기존 blob URL 해제 (메모리 누수 방지)
  const oldImg = afterThumb.querySelector('img');
  if (oldImg && oldImg.src.startsWith('blob:')) {
    URL.revokeObjectURL(oldImg.src);
  }

  const url = URL.createObjectURL(resultBlob);
  const img = new Image();
  img.alt = 'result preview';
  img.onload = () => {
    afterThumb.innerHTML = '';
    afterThumb.appendChild(img);
    afterThumb.className = 'preview-thumb';
  };
  img.onerror = () => {
    // 이미지 로드 실패 시 fallback
    afterThumb.className = 'preview-thumb placeholder-after';
  };
  img.src = url;

  afterSize.textContent = formatSize(resultBlob.size);

  if (savedPct > 0) {
    badge.textContent = `-${savedPct}%`;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

/* ---------- HEIC Conversion ---------- */
async function convertHEIC() {
  const files = state.heic.files;
  if (!files.length) return;

  const quality = parseInt(document.getElementById('heic-quality').value) / 100;
  const btn = document.getElementById('heic-convert-btn');
  btn.disabled = true;
  btn.querySelector('span:not(.btn-icon)').textContent = state.lang === 'ko' ? '변환 중...' : 'Converting...';

  showProgress('heic', 0, files.length);
  state.heic.results = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    setFileStatus('heic', i, state.lang === 'ko' ? '변환 중...' : 'converting...', '');

    try {
      const resultBlob = await heic2any({
        blob: f,
        toType: 'image/jpeg',
        quality: quality
      });

      const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
      const outName = f.name.replace(/\.(heic|heif)$/i, '.jpg');
      state.heic.results.push({ name: outName, blob });

      if (i === 0) {
        const pct = Math.round((1 - blob.size / f.size) * 100);
        updateAfterPreview('heic', blob, pct > 0 ? pct : 0);
      }

      setFileStatus('heic', i, state.lang === 'ko' ? '완료' : 'done', 'done');
    } catch (err) {
      console.error('HEIC convert error:', err);
      setFileStatus('heic', i, state.lang === 'ko' ? '실패' : 'failed', 'error');
    }

    updateProgress('heic', i + 1, files.length);
  }

  btn.disabled = false;
  const zipLabel = state.lang === 'ko' ? 'ZIP으로 모두 다운로드' : 'Download all as ZIP';
  btn.querySelector('span:not(.btn-icon)').textContent = zipLabel;
  btn.onclick = () => downloadZip('heic');

  updateButtons('heic', true);
  showToast(state.lang === 'ko' ? `${state.heic.results.length}개 파일 변환 완료!` : `${state.heic.results.length} file(s) converted!`);
}

/* ---------- Image Compression ---------- */
async function compressImages() {
  const files = state.compress.files;
  if (!files.length) return;

  const quality = parseInt(document.getElementById('compress-quality').value) / 100;
  const toWebP  = document.getElementById('compress-webp-toggle').classList.contains('on');
  const mimeOut = toWebP ? 'image/webp' : null;
  const extOut  = toWebP ? '.webp' : null;

  const btn = document.getElementById('compress-btn');
  btn.disabled = true;
  btn.querySelector('span:not(.btn-icon)').textContent = state.lang === 'ko' ? '압축 중...' : 'Compressing...';

  showProgress('compress', 0, files.length);
  state.compress.results = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    setFileStatus('compress', i, state.lang === 'ko' ? '압축 중...' : 'compressing...', '');

    try {
      const blob = await compressImageFile(f, quality, mimeOut);
      const origExt = '.' + f.name.split('.').pop();
      const outName = f.name.replace(/\.[^.]+$/, (extOut || origExt));
      state.compress.results.push({ name: outName, blob });

      if (i === 0) {
        const pct = Math.round((1 - blob.size / f.size) * 100);
        if (toWebP) {
          document.getElementById('compress-after-fmt').textContent = '.WEBP';
        }
        updateAfterPreview('compress', blob, pct > 0 ? pct : 0);
      }

      setFileStatus('compress', i, state.lang === 'ko' ? '완료' : 'done', 'done');
    } catch (err) {
      console.error('Compress error:', err);
      setFileStatus('compress', i, state.lang === 'ko' ? '실패' : 'failed', 'error');
    }

    updateProgress('compress', i + 1, files.length);
  }

  btn.disabled = false;
  const zipLabel = state.lang === 'ko' ? 'ZIP으로 모두 다운로드' : 'Download all as ZIP';
  btn.querySelector('span:not(.btn-icon)').textContent = zipLabel;
  btn.onclick = () => downloadZip('compress');

  updateButtons('compress', true);
  showToast(state.lang === 'ko' ? `${state.compress.results.length}개 파일 압축 완료!` : `${state.compress.results.length} file(s) compressed!`);
}

/* Canvas-based compression */
function compressImageFile(file, quality, mimeOut) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const mime = mimeOut || file.type || 'image/jpeg';
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed'));
      }, mime, quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

/* ---------- Download ---------- */
async function downloadZip(type) {
  const results = state[type].results;
  if (!results.length) return;

  if (results.length === 1) {
    downloadBlob(results[0].blob, results[0].name);
    return;
  }

  const zip = new JSZip();
  results.forEach(r => zip.file(r.name, r.blob));

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  downloadBlob(zipBlob, 'pixlit-' + type + '.zip');
}

function downloadIndividual(type) {
  const results = state[type].results;
  results.forEach((r, i) => {
    setTimeout(() => downloadBlob(r.blob, r.name), i * 200);
  });
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

/* ---------- Progress ---------- */
function showProgress(type, done, total) {
  const wrap = document.getElementById(type + '-progress');
  wrap.classList.add('visible');
  updateProgress(type, done, total);
}

function updateProgress(type, done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById(type + '-progress-fill').style.width = pct + '%';
  const label = state.lang === 'ko'
    ? `처리 중... ${done} / ${total}`
    : `Processing... ${done} / ${total}`;
  document.getElementById(type + '-progress-label').textContent = label;
}

/* ---------- File status ---------- */
function setFileStatus(type, idx, text, cls) {
  const el = document.getElementById(type + '-status-' + idx);
  if (!el) return;
  el.textContent = text;
  el.className = 'file-item-status' + (cls ? ' ' + cls : '');
}

/* ---------- Toast ---------- */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ---------- Language toggle ---------- */
function toggleLang() {
  state.lang = state.lang === 'ko' ? 'en' : 'ko';
  localStorage.setItem('pixlit-lang', state.lang);
  const btn = document.getElementById('lang-btn');
  btn.textContent = state.lang === 'ko' ? '🌐 KO' : '🌐 EN';
  applyLang();
}

function applyLang() {
  document.querySelectorAll('[data-ko]').forEach(el => {
    const val = el.getAttribute('data-' + state.lang);
    if (val !== null) el.innerHTML = val;
  });
}

/* ---------- Mobile menu ---------- */
function toggleMobileMenu() {
  // Simple toggle: show/hide nav links as overlay
  const existing = document.getElementById('mobile-nav');
  if (existing) { existing.remove(); return; }

  const nav = document.createElement('div');
  nav.id = 'mobile-nav';
  nav.style.cssText = `
    position:fixed;top:56px;left:0;right:0;background:#fff;
    border-bottom:0.5px solid #E2E8F0;padding:12px 16px;z-index:199;
    display:flex;flex-direction:column;gap:4px;
  `;

  const links = [
    { href: 'index.html', ko: '도구', en: 'Tools' },
    { href: 'pages/about.html', ko: '소개', en: 'About' },
    { href: 'pages/contact.html', ko: '문의', en: 'Contact' },
    { href: 'pages/privacy.html', ko: '개인정보처리방침', en: 'Privacy policy' },
    { href: 'pages/terms.html', ko: '이용약관', en: 'Terms of use' },
  ];

  links.forEach(l => {
    const a = document.createElement('a');
    a.href = l.href;
    a.textContent = state.lang === 'ko' ? l.ko : l.en;
    a.style.cssText = 'padding:10px 12px;border-radius:7px;color:#475569;font-size:15px;font-weight:500;display:block';
    nav.appendChild(a);
  });

  document.body.appendChild(nav);
}

/* ---------- Helpers ---------- */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  state.lang = localStorage.getItem('pixlit-lang') || 'ko';
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = state.lang === 'ko' ? '🌐 KO' : '🌐 EN';
  applyLang();
  updateSliderTrack('heic-quality', 90);
  updateSliderTrack('compress-quality', 80);
});
