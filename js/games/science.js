// ============================================================
//  EDUQUEST — Science Quiz
// ============================================================

const scienceQuestions = [
  { q:'What gas do plants absorb for photosynthesis?', options:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'], a:2 },
  { q:'What is H₂O commonly known as?', options:['Salt','Water','Acid','Alcohol'], a:1 },
  { q:'Which planet is known as the Red Planet?', options:['Venus','Mars','Jupiter','Mercury'], a:1 },
  { q:'What force pulls objects towards Earth?', options:['Magnetism','Friction','Gravity','Inertia'], a:2 },
  { q:'What part of the cell contains DNA?', options:['Cytoplasm','Nucleus','Membrane','Ribosome'], a:1 },
  { q:'Which energy is stored in food?', options:['Kinetic','Potential','Chemical','Thermal'], a:2 },
  { q:'Boiling point of water at sea level?', options:['90°C','95°C','100°C','110°C'], a:2 },
  { q:'Which organ pumps blood?', options:['Lungs','Heart','Brain','Liver'], a:1 },
  { q:'Symbol for Sodium?', options:['So','Sd','Na','Sn'], a:2 },
  { q:'Animals that eat only plants are called?', options:['Carnivores','Herbivores','Omnivores','Detritivores'], a:1 }
];

let sciState = { idx:0, score:0, answered:false };

function initScienceQuiz() {
  sciState = { idx:0, score:0, answered:false };
  document.getElementById('science-score').textContent = '0';
  document.getElementById('science-qnum').textContent = '1';
  document.getElementById('science-qtotal').textContent = scienceQuestions.length;
  document.getElementById('science-feedback').style.display = 'none';
  document.getElementById('science-complete').style.display = 'none';
  renderScienceQuestion();
  document.getElementById('science-restart').onclick = () => { initScienceQuiz(); };
  document.getElementById('science-next').onclick = () => {
    sciState.idx++;
    if (sciState.idx >= scienceQuestions.length) { completeScienceQuiz(); return; }
    sciState.answered = false;
    document.getElementById('science-feedback').style.display = 'none';
    document.getElementById('science-qnum').textContent = sciState.idx + 1;
    document.getElementById('game-progress-fill').style.width = ((sciState.idx / scienceQuestions.length) * 100) + '%';
    renderScienceQuestion();
  };
}

function renderScienceQuestion() {
  const q = scienceQuestions[sciState.idx];
  document.getElementById('science-question').textContent = q.q;
  const opts = document.getElementById('science-options');
  opts.innerHTML = '';
  q.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = text;
    btn.onclick = () => handleSciAnswer(i, btn, q);
    opts.appendChild(btn);
  });
}

function handleSciAnswer(choice, btn, q) {
  if (sciState.answered) return;
  sciState.answered = true;
  const opts = document.querySelectorAll('#science-options .option-btn');
  opts.forEach(b => b.disabled = true);
  const fb = document.getElementById('science-feedback');
  const ft = document.getElementById('science-feedback-text');
  if (choice === q.a) {
    btn.classList.add('correct');
    sciState.score += 10;
    document.getElementById('science-score').textContent = sciState.score;
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

function completeScienceQuiz() {
  userData.points += sciState.score;
  userData.scienceProgress = 100;
  userData.lessonsCompleted++;
  awardBadge('science');
  setSubjectScore('science', Math.round((sciState.score / (scienceQuestions.length * 10)) * 100));
  logActivity('Completed', 'Science', `Score ${sciState.score}/${scienceQuestions.length * 10}`);
  saveUserData();
  document.getElementById('science-complete-text').textContent = `Well done! You scored ${sciState.score} out of ${scienceQuestions.length * 10}.`;
  document.getElementById('science-complete').style.display = 'block';
  document.getElementById('science-feedback').style.display = 'none';
  setTimeout(() => showResults(sciState.score, sciState.score/10, scienceQuestions.length, 'science'), 2000);
}
