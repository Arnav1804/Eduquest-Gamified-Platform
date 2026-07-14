// ============================================================
//  EDUQUEST — Game Launcher & Navigation
// ============================================================

let currentGameType = null;

function showGameStart(type) {
  currentGameType = type;
  const meta = {
    math:     { icon:'➕', title:'Mathematics Puzzle', desc:'Solve 10 math problems in 60 seconds. Each correct answer earns +10 points!', time:'⏱ 60s Timer', pts:'⭐ +10 pts/correct', diff:'📊 Easy' },
    science:  { icon:'🔬', title:'Science Quiz', desc:'Answer 10 science questions spanning Physics, Biology and Chemistry.', time:'⏱ No timer', pts:'⭐ +10 pts/correct', diff:'📊 Medium' },
    geometry: { icon:'📐', title:'Geometry Drill', desc:'Test your knowledge of shapes, angles, areas and perimeters.', time:'⏱ No timer', pts:'⭐ +10 pts/correct', diff:'📊 Medium' },
    physics:  { icon:'⚡', title:'Physics Rapid-Fire', desc:'Answer as many physics questions as possible in 45 seconds!', time:'⏱ 45s Timer', pts:'⭐ +5 pts/correct', diff:'📊 Hard' },
    memory:   { icon:'🧠', title:'Memory Match — Vocab', desc:'Match vocabulary words to their definitions. Complete all 10 pairs!', time:'⏱ No timer', pts:'⭐ +20 pts bonus', diff:'📊 Brain Teaser' }
  }[type];

  document.getElementById('game-start-icon').textContent = meta.icon;
  document.getElementById('game-start-title').textContent = meta.title;
  document.getElementById('game-start-desc').textContent = meta.desc;
  document.getElementById('game-info-time').textContent = meta.time;
  document.getElementById('game-info-pts').textContent = meta.pts;
  document.getElementById('game-info-difficulty').textContent = meta.diff;

  showScreen('game-screen');
  document.getElementById('game-start-screen').style.display = 'flex';
  document.getElementById('game-active-area').style.display = 'none';
  document.getElementById('results-screen').classList.remove('active');
}

function launchCurrentGame() {
  document.getElementById('game-start-screen').style.display = 'none';
  document.getElementById('game-active-area').style.display = 'block';
  document.getElementById('results-screen').classList.remove('active');
  startLesson(currentGameType);
}

function replayCurrentGame() {
  if (currentGameType) showGameStart(currentGameType);
}

function confirmExitGame() {
  document.getElementById('exit-modal').classList.add('show');
}

function exitGameConfirmed() {
  document.getElementById('exit-modal').classList.remove('show');
  if (mathState.timerInterval) clearInterval(mathState.timerInterval);
  if (phyState.timerId) clearInterval(phyState.timerId);
  showDashboard();
}

function startLesson(lessonType) {
  document.getElementById('game-title').textContent = {
    math:'Math Puzzle', science:'Science Quiz', geometry:'Geometry Drill',
    physics:'Physics Rapid-Fire', memory:'Memory Match'
  }[lessonType] || 'Game';

  const timerPill = document.getElementById('timer-pill');
  timerPill.style.display = (lessonType === 'math' || lessonType === 'physics') ? 'flex' : 'none';

  document.getElementById('game-score').textContent = '0';
  document.getElementById('game-progress-fill').style.width = '0%';

  const sections = ['math-game-section','science-quiz-section','geometry-game-section','physics-game-section','memory-game-section'];
  sections.forEach(s => { const el = document.getElementById(s); if (el) el.style.display = 'none'; });

  if (lessonType === 'math') {
    document.getElementById('math-game-section').style.display = 'block';
    initMathQuiz();
  } else if (lessonType === 'memory') {
    document.getElementById('memory-game-section').style.display = 'block';
    initMemoryGame();
  } else if (lessonType === 'science') {
    document.getElementById('science-quiz-section').style.display = 'block';
    initScienceQuiz();
  } else if (lessonType === 'geometry') {
    document.getElementById('geometry-game-section').style.display = 'block';
    initGeometryDrill();
  } else if (lessonType === 'physics') {
    document.getElementById('physics-game-section').style.display = 'block';
    initPhysicsRapidFire();
  }
}
