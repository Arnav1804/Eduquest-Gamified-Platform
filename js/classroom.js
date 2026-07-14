// ============================================================
//  EDUQUEST — Class-based Leaderboard
//  Teachers create classes with unique codes.
//  Students join classes and appear on per-class leaderboards.
//  All data persisted via localStorage.
// ============================================================

const CLASSES_KEY = 'eduquest_classes';
const JOINED_KEY  = 'eduquest_joined_classes';
const MEMBERS_KEY = 'eduquest_class_members';

// ─── Helpers ─────────────────────────────────────────────

function _getClasses() {
  try { return JSON.parse(localStorage.getItem(CLASSES_KEY) || '[]'); } catch { return []; }
}

function _saveClasses(arr) {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(arr));
}

function _getJoinedClasses() {
  try { return JSON.parse(localStorage.getItem(JOINED_KEY) || '[]'); } catch { return []; }
}

function _saveJoinedClasses(arr) {
  localStorage.setItem(JOINED_KEY, JSON.stringify(arr));
}

function _getClassMembers() {
  try { return JSON.parse(localStorage.getItem(MEMBERS_KEY) || '{}'); } catch { return {}; }
}

function _saveClassMembers(obj) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(obj));
}

/**
 * Generate a random 6-character uppercase alphanumeric code.
 */
function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness against existing classes
  const existing = _getClasses().map(c => c.code);
  if (existing.includes(code)) return generateClassCode();
  return code;
}

// ─── Teacher: Create Class ───────────────────────────────

function openCreateClassModal() {
  const code = generateClassCode();
  document.getElementById('create-class-code').textContent = code;
  document.getElementById('create-class-code').dataset.code = code;
  document.getElementById('create-class-name').value = '';
  document.getElementById('create-class-error').style.display = 'none';
  document.getElementById('create-class-modal').classList.add('show');
}

function closeCreateClassModal() {
  document.getElementById('create-class-modal').classList.remove('show');
}

function confirmCreateClass() {
  const name = document.getElementById('create-class-name').value.trim();
  const code = document.getElementById('create-class-code').dataset.code;
  const errorEl = document.getElementById('create-class-error');

  if (!name) {
    errorEl.textContent = 'Please enter a class name.';
    errorEl.style.display = 'block';
    return;
  }
  if (name.length > 50) {
    errorEl.textContent = 'Class name must be 50 characters or fewer.';
    errorEl.style.display = 'block';
    return;
  }

  const classes = _getClasses();
  classes.push({
    code: code,
    name: name,
    createdBy: userData.username || 'Teacher',
    createdAt: Date.now()
  });
  _saveClasses(classes);

  // Initialize empty member list for this class
  const members = _getClassMembers();
  if (!members[code]) members[code] = [];
  _saveClassMembers(members);

  closeCreateClassModal();
  toast('Class "' + name + '" created! Code: ' + code, 'success');
  renderTeacherClasses();
}

// ─── Student: Join Class ─────────────────────────────────

function openJoinClassModal() {
  document.getElementById('join-class-code').value = '';
  document.getElementById('join-class-error').style.display = 'none';
  document.getElementById('join-class-modal').classList.add('show');
}

function closeJoinClassModal() {
  document.getElementById('join-class-modal').classList.remove('show');
}

function confirmJoinClass() {
  const codeInput = document.getElementById('join-class-code').value.trim().toUpperCase();
  const errorEl = document.getElementById('join-class-error');

  // Validate format
  if (!/^[A-Z0-9]{6}$/.test(codeInput)) {
    errorEl.textContent = 'Please enter a valid 6-character class code.';
    errorEl.style.display = 'block';
    return;
  }

  // Check class exists
  const classes = _getClasses();
  const cls = classes.find(c => c.code === codeInput);
  if (!cls) {
    errorEl.textContent = 'Class not found. Please check the code.';
    errorEl.style.display = 'block';
    return;
  }

  // Check not already joined
  const joined = _getJoinedClasses();
  if (joined.includes(codeInput)) {
    errorEl.textContent = 'You have already joined this class.';
    errorEl.style.display = 'block';
    return;
  }

  // Join the class
  joined.push(codeInput);
  _saveJoinedClasses(joined);

  // Add student to class members
  const members = _getClassMembers();
  if (!members[codeInput]) members[codeInput] = [];

  const streak = typeof getStreak === 'function' ? getStreak() : { currentStreak: 0 };
  members[codeInput].push({
    username: userData.username || 'Student',
    score: userData.points || 0,
    currentStreak: streak.currentStreak || 0
  });
  _saveClassMembers(members);

  closeJoinClassModal();
  toast('Joined class "' + cls.name + '" successfully!', 'success');
  renderStudentClasses();
}

// ─── Teacher: Render Classes ─────────────────────────────

function renderTeacherClasses() {
  const container = document.getElementById('teacher-classes-list');
  if (!container) return;

  const classes = _getClasses();
  if (classes.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:12px 0;">No classes created yet. Click "+ Create Class" to get started.</p>';
    return;
  }

  const members = _getClassMembers();
  container.innerHTML = classes.map(cls => {
    const count = (members[cls.code] || []).length;
    return `<div class="class-card">
      <div class="class-card-info">
        <div class="class-card-name">${cls.name}</div>
        <div class="class-card-meta">${count} student${count !== 1 ? 's' : ''} · Created ${getRelativeTime(new Date(cls.createdAt))}</div>
      </div>
      <div class="class-code-display">${cls.code}</div>
      <button class="btn btn-sm btn-secondary" onclick="showTeacherLeaderboard('${cls.code}')">Leaderboard</button>
    </div>`;
  }).join('');
}

/**
 * Show leaderboard for a class (from teacher view).
 */
function showTeacherLeaderboard(classCode) {
  const section = document.getElementById('teacher-leaderboard-section');
  if (!section) return;
  section.style.display = 'block';

  const classes = _getClasses();
  const cls = classes.find(c => c.code === classCode);
  const titleEl = document.getElementById('teacher-leaderboard-title');
  if (titleEl) titleEl.textContent = cls ? cls.name + ' Leaderboard' : 'Leaderboard';

  _renderLeaderboardTable('teacher-leaderboard', classCode);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Student: Render Classes ─────────────────────────────

function renderStudentClasses() {
  const container = document.getElementById('student-classes-list');
  const section = document.getElementById('class-section');
  if (!container || !section) return;

  // Only show for students
  if (userData.role === 'faculty') {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  const joined = _getJoinedClasses();
  const allClasses = _getClasses();

  if (joined.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:8px 0;">No classes joined yet. Ask your teacher for a class code!</p>';
    document.getElementById('class-leaderboard-section').style.display = 'none';
    return;
  }

  container.innerHTML = joined.map(code => {
    const cls = allClasses.find(c => c.code === code);
    const name = cls ? cls.name : 'Unknown Class';
    return `<div class="class-card class-card-student" onclick="showStudentLeaderboard('${code}')">
      <div class="class-card-info">
        <div class="class-card-name">${name}</div>
        <div class="class-card-meta">Code: ${code}</div>
      </div>
      <span style="color:var(--primary); font-weight:700; font-size:0.85rem;">View Board →</span>
    </div>`;
  }).join('');
}

/**
 * Show leaderboard for a class (from student view).
 */
function showStudentLeaderboard(classCode) {
  const section = document.getElementById('class-leaderboard-section');
  if (!section) return;
  section.style.display = 'block';

  const classes = _getClasses();
  const cls = classes.find(c => c.code === classCode);
  const titleEl = document.getElementById('student-leaderboard-title');
  if (titleEl) titleEl.textContent = cls ? cls.name + ' Leaderboard' : 'Leaderboard';

  _renderLeaderboardTable('class-leaderboard', classCode);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Leaderboard Rendering ──────────────────────────────

function _renderLeaderboardTable(containerId, classCode) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const members = _getClassMembers();
  const list = (members[classCode] || []).slice();

  if (list.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:12px 0;">No students in this class yet.</p>';
    return;
  }

  // Sort by score descending
  list.sort((a, b) => (b.score || 0) - (a.score || 0));

  const rankIcons = ['🥇', '🥈', '🥉'];

  container.innerHTML = `
    <div class="leaderboard-table">
      <div class="leaderboard-header">
        <span class="lb-col-rank">Rank</span>
        <span class="lb-col-name">Student</span>
        <span class="lb-col-score">Score</span>
        <span class="lb-col-streak">Streak</span>
      </div>
      ${list.map((m, i) => {
        const rank = i < 3 ? rankIcons[i] : (i + 1);
        const rankClass = i < 3 ? 'lb-rank-top' : '';
        return `<div class="leaderboard-row ${rankClass}">
          <span class="lb-col-rank">${rank}</span>
          <span class="lb-col-name">
            <span class="lb-avatar">${(m.username || 'S').charAt(0).toUpperCase()}</span>
            ${m.username || 'Student'}
          </span>
          <span class="lb-col-score">${m.score || 0}</span>
          <span class="lb-col-streak">🔥 ${m.currentStreak || 0}</span>
        </div>`;
      }).join('')}
    </div>`;
}

// ─── Update Member Data After Quiz ──────────────────────

/**
 * Called after a quiz is completed. Updates the current student's
 * score and streak in all joined class member lists.
 */
function updateClassMemberData() {
  const joined = _getJoinedClasses();
  if (joined.length === 0) return;

  const members = _getClassMembers();
  const streak = typeof getStreak === 'function' ? getStreak() : { currentStreak: 0 };
  const username = userData.username || 'Student';

  joined.forEach(code => {
    if (!members[code]) members[code] = [];
    const idx = members[code].findIndex(m => m.username === username);
    const entry = {
      username: username,
      score: userData.points || 0,
      currentStreak: streak.currentStreak || 0
    };
    if (idx >= 0) {
      members[code][idx] = entry;
    } else {
      members[code].push(entry);
    }
  });

  _saveClassMembers(members);
}
