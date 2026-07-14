// ============================================================
//  EDUQUEST — Utilities & Data Persistence
// ============================================================

let userData = {
  role: 'student', username: 'Student', phone: '', email: '',
  gradeLevel: '6', points: 0, badges: [],
  lessonsCompleted: 0, mathProgress: 0, scienceProgress: 0,
  memoryProgress: 0, geometryProgress: 0, physicsProgress: 0,
  language: 'en'
};

function saveUserData() { localStorage.setItem('eduquest_user', JSON.stringify(userData)); }

function loadUserData() {
  const stored = localStorage.getItem('eduquest_user');
  if (stored) try { userData = { ...userData, ...JSON.parse(stored) }; } catch(e) {}
}

function getSubjectScores() {
  try { return JSON.parse(localStorage.getItem('eduquest_scores') || '{}'); } catch { return {}; }
}

function setSubjectScore(subject, value) {
  const store = getSubjectScores();
  store[subject] = Math.round(Math.max(0, Math.min(100, value)));
  localStorage.setItem('eduquest_scores', JSON.stringify(store));
  const el = document.getElementById(`${subject}-score-display`);
  if (el) el.textContent = store[subject];
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function getRelativeTime(date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

function awardBadge(type) {
  if (!userData.badges) userData.badges = [];
  if (!userData.badges.includes(type)) {
    userData.badges.push(type);
    toast(`🏅 Badge Unlocked: ${type.replace('_',' ')}!`, 'success');
  }
}

function exportUserData() {
  const dataStr = JSON.stringify({ ...userData, scores: getSubjectScores(), activity: JSON.parse(localStorage.getItem('eduquest_activity')||'[]') }, null, 2);
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  a.download = `eduquest_${userData.username || 'student'}_progress.json`;
  a.click();
  toast('Progress exported!', 'success');
}

function importUserData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        userData = { ...userData, ...imported };
        saveUserData(); updateDashboard();
        toast('Progress imported successfully!', 'success');
      } catch { toast('Invalid file format', 'error'); }
    };
    reader.readAsText(e.target.files[0]);
  };
  input.click();
}
