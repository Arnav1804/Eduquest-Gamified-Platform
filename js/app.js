// ============================================================
//  EDUQUEST — App Core
// ============================================================

window.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  loadUserData();

  const stored = localStorage.getItem('eduquest_user');
  if (stored) {
    try { userData = { ...userData, ...JSON.parse(stored) }; } catch(e) {}
  }

  const hash = window.location.hash;
  if (userData.role === 'faculty' && !hash) {
    showTeacherDashboard();
  } else if (stored) {
    showDashboard();
  } else {
    showScreen('landing-screen');
  }

  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    loader.classList.add('hidden');
    setTimeout(() => loader.style.display = 'none', 400);
  }, 600);

  setupListeners();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

function setupListeners() {
  const dropArea = document.getElementById('upload-drop-area');
  const fileInput = document.getElementById('file-input');
  if (dropArea) {
    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('dragover'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
    dropArea.addEventListener('drop', e => { e.preventDefault(); dropArea.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', e => handleFiles(e.target.files));
  }

  const teacherUpload = document.getElementById('student-data-upload');
  if (teacherUpload) teacherUpload.addEventListener('change', handleTeacherUpload);

  const mathOpts = document.getElementById('math-options');
  if (mathOpts) {
    mathOpts.addEventListener('click', function(e) {
      if (e.target.classList.contains('option-btn')) {
        const idx = Array.from(this.children).indexOf(e.target);
        handleMathAnswer(idx);
      }
    });
  }

  const annBtn = document.getElementById('post-announcement-btn');
  if (annBtn) annBtn.addEventListener('click', postAnnouncement);

  document.querySelectorAll('[data-lesson]').forEach(card => {
    card.addEventListener('keydown', e => { if (e.key === 'Enter') card.querySelector('button').click(); });
  });
}

function showDashboard() {
  showLoading(() => {
    showScreen('dashboard-screen');
    updateDashboard();
    initStudentPortal();
    const isFaculty = userData.role === 'faculty';
    document.getElementById('student-portal').style.display = isFaculty ? 'none' : '';
    document.getElementById('materials-section').style.display = isFaculty ? '' : 'none';
    document.getElementById('nav-teacher-section').style.display = isFaculty ? '' : 'none';
    updateSidebar();
  });
}

function showTeacherDashboard() {
  showLoading(() => {
    showScreen('teacher-screen');
    document.getElementById('teacher-name-display').textContent = userData.username;
    document.getElementById('nav-teacher-section').style.display = '';
    updateSidebar();
    initTeacherDashboard();
  });
}

function enterAsGuest(role) {
  if (role === 'faculty') {
    userData = { ...userData, role: 'faculty', username: 'Teacher', email: 'teacher@demo.com' };
    saveUserData();
    showTeacherDashboard();
  } else {
    userData = { ...userData, role: 'student', username: 'Guest Student' };
    saveUserData();
    showDashboard();
  }
  toast('Welcome to EduQuest! 🎉', 'success');
}

function logout() {
  localStorage.removeItem('eduquest_user');
  userData = { role:'student', username:'Student', points:0, badges:[], lessonsCompleted:0, mathProgress:0, scienceProgress:0, memoryProgress:0, geometryProgress:0, physicsProgress:0, language:'en' };
  showScreen('landing-screen');
  closeSidebar();
  toast('Signed out successfully');
}
