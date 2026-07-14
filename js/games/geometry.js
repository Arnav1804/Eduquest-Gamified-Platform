// ============================================================
//  EDUQUEST — Geometry Drill
// ============================================================

const geometryQuestions = [
  { q:'Sum of interior angles of a triangle?', options:['90°','180°','270°','360°'], a:1 },
  { q:'Area of rectangle l×w. For l=8, w=5?', options:['30','35','40','45'], a:2 },
  { q:'Perimeter of square side 6?', options:['18','20','22','24'], a:3 },
  { q:'Right triangle sides 3,4,? (hypotenuse)', options:['5','6','7','8'], a:0 },
  { q:'Number of sides in a hexagon?', options:['5','6','7','8'], a:1 }
];

let geoState = { idx:0, score:0, answered:false };

function initGeometryDrill() {
  geoState = { idx:0, score:0, answered:false };
  document.getElementById('geometry-score').textContent = '0';
  document.getElementById('geometry-qnum').textContent = '1';
  document.getElementById('geometry-qtotal').textContent = geometryQuestions.length;
  document.getElementById('geometry-feedback').style.display = 'none';
  document.getElementById('geometry-complete').style.display = 'none';
  renderGeometryQuestion();
  document.getElementById('geometry-restart').onclick = initGeometryDrill;
  document.getElementById('geometry-next').onclick = () => {
    geoState.idx++;
    if (geoState.idx >= geometryQuestions.length) { completeGeometry(); return; }
    geoState.answered = false;
    document.getElementById('geometry-feedback').style.display = 'none';
    document.getElementById('geometry-qnum').textContent = geoState.idx + 1;
    document.getElementById('game-progress-fill').style.width = ((geoState.idx / geometryQuestions.length) * 100) + '%';
    renderGeometryQuestion();
  };
}

function renderGeometryQuestion() {
  const q = geometryQuestions[geoState.idx];
  document.getElementById('geometry-question').textContent = q.q;
  const opts = document.getElementById('geometry-options');
  opts.innerHTML = '';
  q.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = text;
    btn.onclick = () => handleGeoAnswer(i, btn, q);
    opts.appendChild(btn);
  });
}

function handleGeoAnswer(choice, btn, q) {
  if (geoState.answered) return;
  geoState.answered = true;
  const opts = document.querySelectorAll('#geometry-options .option-btn');
  opts.forEach(b => b.disabled = true);
  const fb = document.getElementById('geometry-feedback');
  const ft = document.getElementById('geometry-feedback-text');
  if (choice === q.a) {
    btn.classList.add('correct');
    geoState.score += 10;
    document.getElementById('geometry-score').textContent = geoState.score;
    ft.textContent = '✓ Correct! +10 points';
    fb.className = 'game-feedback correct';
    incrementDailyGoal(1);
  } else {
    btn.classList.add('incorrect');
    opts[q.a].classList.add('correct');
    ft.textContent = `✗ Incorrect! Answer: ${q.options[q.a]}`;
    fb.className = 'game-feedback incorrect';
  }
  fb.style.display = 'block';
}

function completeGeometry() {
  userData.points += geoState.score;
  userData.geometryProgress = 100;
  userData.lessonsCompleted++;
  awardBadge('geometry');
  setSubjectScore('math', Math.round((geoState.score / (geometryQuestions.length * 10)) * 100));
  logActivity('Completed', 'Geometry', `Score ${geoState.score}/${geometryQuestions.length * 10}`);
  saveUserData();
  document.getElementById('geometry-complete-text').textContent = `Well done! You scored ${geoState.score} out of ${geometryQuestions.length * 10}.`;
  document.getElementById('geometry-complete').style.display = 'block';
  document.getElementById('geometry-feedback').style.display = 'none';
  setTimeout(() => showResults(geoState.score, geoState.score/10, geometryQuestions.length, 'geometry'), 2000);
}
