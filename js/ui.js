// ============================================================
//  EDUQUEST — UI Helpers
// ============================================================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'fade-in');
  });
  const el = document.getElementById(id);
  el.classList.add('active');
  setTimeout(() => el.classList.add('fade-in'), 10);
  window.scrollTo(0, 0);
}

function showLoading(cb, delay=250) {
  const loader = document.getElementById('page-loader');
  loader.style.display = 'flex';
  loader.classList.remove('hidden');
  setTimeout(() => {
    cb();
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.style.display = 'none', 400);
    }, 150);
  }, delay);
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateSidebar() {
  const name = userData.username || 'User';
  document.getElementById('sidebar-username').textContent = name;
  const initial = name.charAt(0).toUpperCase();
  document.getElementById('sidebar-avatar').textContent = initial;
  document.getElementById('topnav-avatar').textContent = initial;
  document.getElementById('sidebar-role').textContent = userData.role === 'faculty'
    ? 'Teacher'
    : `Student · Grade ${userData.gradeLevel || '6'}`;
}

function toast(msg, type='info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==='success'?'✓':type==='error'?'✗':'ℹ'}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => { el.remove(); }, 3200);
}

function openUploadModal() { document.getElementById('upload-modal').classList.add('show'); }

function closeUploadModal() {
  document.getElementById('upload-modal').classList.remove('show');
  document.getElementById('upload-preview').style.display = 'none';
  document.getElementById('confirm-upload').disabled = true;
  document.getElementById('file-input').value = '';
}

function handleFiles(files) {
  if (!files.length) return;
  const file = files[0];
  const preview = document.getElementById('upload-preview');
  preview.style.display = 'block';
  preview.querySelector('.file-name').textContent = file.name;
  preview.querySelector('.file-size').textContent = formatFileSize(file.size);
  const confirm = document.getElementById('confirm-upload');
  confirm.disabled = false;
  preview.querySelector('.remove-file').onclick = () => { preview.style.display='none'; confirm.disabled=true; };
  confirm.onclick = () => {
    addMaterialToGrid(file.name, formatFileSize(file.size));
    closeUploadModal();
    toast('Material uploaded!', 'success');
  };
}

function addMaterialToGrid(name, size) {
  const grid = document.getElementById('materials-grid');
  if (!grid) return;
  const ext = name.split('.').pop().toUpperCase();
  const card = document.createElement('div');
  card.className = 'material-card';
  card.innerHTML = `<div class="material-thumb">📄</div>
    <div class="material-info">
      <h4>${name.split('.')[0]}</h4>
      <p>Uploaded material</p>
      <div class="material-meta">
        <span class="chip chip-primary">${ext}</span>
        <span class="text-xs text-muted">${size}</span>
      </div>
    </div>`;
  grid.appendChild(card);
}
