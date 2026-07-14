// ============================================================
//  EDUQUEST — Dashboard (Student & Teacher)
// ============================================================

function updateDashboard() {
  document.getElementById('username').textContent = userData.username || 'Student';
  document.getElementById('total-points').textContent = userData.points || 0;
  document.getElementById('badges-count').textContent = (userData.badges || []).length;
  document.getElementById('lessons-completed').textContent = userData.lessonsCompleted || 0;

  const progressMap = { math: userData.mathProgress||0, science: userData.scienceProgress||0, geometry: userData.geometryProgress||0, physics: userData.physicsProgress||0, memory: userData.memoryProgress||0 };
  Object.entries(progressMap).forEach(([lesson, pct]) => {
    const bar = document.querySelector(`.progress-fill[data-lesson="${lesson}"]`);
    if (bar) bar.style.width = pct + '%';
    const label = document.getElementById(`${lesson}-pct`);
    if (label) label.textContent = pct + '%';
  });

  const scores = getSubjectScores();
  ['math','science','english'].forEach(s => {
    const el = document.getElementById(`${s}-score-display`);
    if (el) el.textContent = scores[s] || 0;
  });

  const activities = JSON.parse(localStorage.getItem('eduquest_activity') || '[]');
  const actEl = document.getElementById('activity-count');
  if (actEl) actEl.textContent = activities.length;

  updateBadges();
  updateContinueLearning();
  updateSidebar();
  loadDailyGoal();
}

function updateBadges() {
  const earned = userData.badges || [];
  document.querySelectorAll('.badge-card').forEach(card => {
    const badge = card.dataset.badge;
    if (earned.includes(badge)) {
      card.classList.remove('locked');
      card.classList.add('unlocked');
    }
  });
}

function updateContinueLearning() {
  const container = document.getElementById('continue-learning-list');
  if (!container) return;
  const lessons = [
    { key: 'math', label: 'Mathematics Puzzle', icon: '➕', pct: userData.mathProgress||0 },
    { key: 'science', label: 'Science Quiz', icon: '🔬', pct: userData.scienceProgress||0 },
    { key: 'memory', label: 'Memory Match', icon: '🧠', pct: userData.memoryProgress||0 }
  ].filter(l => l.pct > 0 && l.pct < 100);

  if (lessons.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:12px 0;">Complete a lesson to track your progress here.</p>';
    return;
  }
  container.innerHTML = lessons.map(l => `
    <div class="continue-card" onclick="showGameStart('${l.key}')">
      <div style="font-size:1.5rem;">${l.icon}</div>
      <div style="flex:1;">
        <div style="font-weight:700; font-size:0.9rem; margin-bottom:6px;">${l.label}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${l.pct}%"></div></div>
      </div>
      <span style="color:var(--primary); font-weight:700; font-size:0.85rem;">${l.pct}%</span>
      <span style="color:var(--text-muted);">→</span>
    </div>
  `).join('');
}

function initStudentPortal() {
  renderRecentActivity();
  renderStudentAnnouncements();
  loadDailyGoal();
}

function loadDailyGoal() {
  const today = new Date().toDateString();
  let goal = JSON.parse(localStorage.getItem('eduquest_daily_goal') || 'null') || { target:5, done:0, text:'Solve 5 problems today', date:today };
  if (goal.date !== today) { goal.done = 0; goal.date = today; }
  const pct = Math.min(100, (goal.done / goal.target) * 100);
  const textEl = document.getElementById('goal-text');
  const doneEl = document.getElementById('daily-goal-done');
  const tgtEl  = document.getElementById('daily-goal-target');
  const fillEl = document.getElementById('daily-goal-fill');
  if (textEl) textEl.textContent = goal.text;
  if (doneEl) doneEl.textContent = goal.done;
  if (tgtEl)  tgtEl.textContent  = goal.target;
  if (fillEl) fillEl.style.width = pct + '%';
  localStorage.setItem('eduquest_daily_goal', JSON.stringify(goal));
}

function incrementDailyGoal(amount=1) {
  const today = new Date().toDateString();
  let goal = JSON.parse(localStorage.getItem('eduquest_daily_goal') || 'null') || { target:5, done:0, text:'Solve 5 problems today', date:today };
  if (goal.date !== today) { goal.done = 0; goal.date = today; }
  goal.done = Math.min(goal.done + amount, goal.target);
  localStorage.setItem('eduquest_daily_goal', JSON.stringify(goal));
  loadDailyGoal();
}

function logActivity(action, subject, details) {
  const list = JSON.parse(localStorage.getItem('eduquest_activity') || '[]');
  list.unshift({ ts: Date.now(), action, subject, details });
  localStorage.setItem('eduquest_activity', JSON.stringify(list.slice(0, 50)));
  renderRecentActivity();
}

function renderRecentActivity() {
  const list = JSON.parse(localStorage.getItem('eduquest_activity') || '[]');
  const container = document.getElementById('recent-activity-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:8px 0;">No recent activity. Start a lesson!</p>';
    return;
  }
  container.innerHTML = list.slice(0, 6).map(item => {
    const d = new Date(item.ts);
    const rel = getRelativeTime(d);
    const icons = { Math:'📐', Science:'🔬', English:'📖', Memory:'🧠', Geometry:'📐', Physics:'⚡' };
    return `<div class="activity-item">
      <div class="activity-dot" style="background:var(--accent);"></div>
      <span class="activity-text">${icons[item.subject]||'📚'} <strong>${item.subject}</strong> — ${item.action}: ${item.details}</span>
      <span class="activity-time">${rel}</span>
    </div>`;
  }).join('');
}

function renderStudentAnnouncements() {
  const list = JSON.parse(localStorage.getItem('eduquest_announcements') || '[]');
  const container = document.getElementById('student-announcements-list');
  const header = document.getElementById('announcements-section-header');
  if (!container) return;
  const myName = userData.username || '';
  const relevant = list.filter(a => a.audience === 'all' || (a.audience === 'student' && (!a.target || a.target === myName)));
  if (header) header.style.display = relevant.length ? '' : 'none';
  container.innerHTML = relevant.slice(-5).reverse().map(a =>
    `<div class="activity-item">
      <div class="activity-dot" style="background:var(--warning);"></div>
      <span class="activity-text">📢 <strong>${a.title}</strong>: ${a.message}</span>
      <span class="activity-time">Notice</span>
    </div>`
  ).join('');
}

let teacherCharts = {};

function initTeacherDashboard() {
  const users = JSON.parse(localStorage.getItem('eduquest_users') || '[]');
  const students = users.filter(u => u.role === 'student');
  const totalPts = students.reduce((s, u) => s + (u.points||0), 0);
  const avgScore = students.length ? Math.round(totalPts / students.length) : 0;
  const totalLessons = students.reduce((s, u) => s + (u.lessonsCompleted||0), 0);
  const totalBadges = students.reduce((s, u) => s + (u.badges||[]).length, 0);

  document.getElementById('teacher-total-students').textContent = students.length;
  document.getElementById('teacher-avg-score').textContent = avgScore;
  document.getElementById('teacher-lessons-done').textContent = totalLessons;
  document.getElementById('teacher-badges').textContent = totalBadges;

  renderStudentList(students);
  renderTeacherCharts(students);
}

function renderStudentList(students) {
  const container = document.getElementById('students-list');
  if (!container) return;
  if (!students.length) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:12px 0;">No student data yet. Students need to register first.</p>';
    return;
  }
  container.innerHTML = students.map(s => {
    const init = (s.username||'S').charAt(0).toUpperCase();
    return `<div class="student-row">
      <div class="student-avatar-sm">${init}</div>
      <div class="student-info">
        <div class="student-name">${s.username||'Student'}</div>
        <div class="student-meta">Grade ${s.gradeLevel||'-'} · ${(s.badges||[]).length} badges · ${s.lessonsCompleted||0} lessons</div>
      </div>
      <div class="student-score">${s.points||0} pts</div>
    </div>`;
  }).join('');
}

function renderTeacherCharts(students) {
  Object.values(teacherCharts).forEach(c => c.destroy());
  teacherCharts = {};

  const chartDefaults = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family:'Plus Jakarta Sans', size:11 } } }, x: { grid: { display:false }, ticks: { font: { family:'Plus Jakarta Sans', size:11 } } } }
  };

  const scoresCtx = document.getElementById('scores-chart');
  if (scoresCtx) {
    teacherCharts.scores = new Chart(scoresCtx, {
      type: 'bar',
      data: {
        labels: ['Math', 'Science', 'English'],
        datasets: [{ label:'Avg Score', data: [
          Math.round(students.reduce((a,s)=>a+(s.mathProgress||0),0)/Math.max(1,students.length)),
          Math.round(students.reduce((a,s)=>a+(s.scienceProgress||0),0)/Math.max(1,students.length)),
          Math.round(students.reduce((a,s)=>a+(s.memoryProgress||0),0)/Math.max(1,students.length))
        ], backgroundColor: ['rgba(91,94,244,0.8)','rgba(0,201,167,0.8)','rgba(245,158,11,0.8)'], borderRadius:8, borderSkipped:false }]
      },
      options: { ...chartDefaults, plugins: { ...chartDefaults.plugins } }
    });
  }

  const compCtx = document.getElementById('completion-chart');
  if (compCtx) {
    const done = students.filter(s => (s.lessonsCompleted||0) >= 1).length;
    teacherCharts.completion = new Chart(compCtx, {
      type: 'doughnut',
      data: {
        labels: ['Completed ≥1', 'Not Started'],
        datasets: [{ data: [done, Math.max(0, students.length - done)], backgroundColor: ['rgba(16,185,129,0.85)','rgba(226,232,240,0.9)'], borderWidth:0, hoverOffset:4 }]
      },
      options: { responsive:true, plugins: { legend: { display:true, position:'bottom', labels:{ font:{ family:'Plus Jakarta Sans' } } } }, cutout:'70%' }
    });
  }

  const badgesCtx = document.getElementById('badges-chart');
  if (badgesCtx) {
    const badgeCounts = {};
    students.forEach(s => (s.badges||[]).forEach(b => badgeCounts[b] = (badgeCounts[b]||0)+1));
    teacherCharts.badges = new Chart(badgesCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(badgeCounts).map(b => b.replace('_',' ')),
        datasets: [{ data: Object.values(badgeCounts), backgroundColor:'rgba(91,94,244,0.75)', borderRadius:6, borderSkipped:false }]
      },
      options: { ...chartDefaults, indexAxis:'y', plugins: { legend:{ display:false } } }
    });
  }
}

function handleTeacherUpload(e) {
  const files = e.target.files;
  const container = document.getElementById('uploaded-files');
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        let users = JSON.parse(localStorage.getItem('eduquest_users') || '[]');
        const existing = users.findIndex(u => u.phone === data.phone || u.email === data.email);
        if (existing >= 0) users[existing] = { ...users[existing], ...data };
        else users.push(data);
        localStorage.setItem('eduquest_users', JSON.stringify(users));
        toast(`Loaded ${data.username || file.name}`, 'success');
        initTeacherDashboard();
      } catch { toast('Invalid JSON file', 'error'); }
    };
    reader.readAsText(file);
    const div = document.createElement('div');
    div.style.cssText = 'padding:8px 12px; background:var(--success-light); border-radius:var(--radius); margin-top:8px; font-size:0.82rem; color:var(--success); font-weight:600;';
    div.textContent = '✓ ' + file.name;
    container.appendChild(div);
  });
}

function postAnnouncement() {
  const title = document.getElementById('ann-title').value.trim();
  const audience = document.getElementById('ann-audience').value;
  const target = document.getElementById('ann-target').value.trim();
  const message = document.getElementById('ann-message').value.trim();
  if (!title || !message) { toast('Please fill in title and message', 'error'); return; }
  const list = JSON.parse(localStorage.getItem('eduquest_announcements') || '[]');
  list.push({ title, audience, target, message, ts: Date.now() });
  localStorage.setItem('eduquest_announcements', JSON.stringify(list));
  document.getElementById('ann-title').value = '';
  document.getElementById('ann-message').value = '';
  document.getElementById('ann-target').value = '';
  toast('Announcement posted!', 'success');
}
