// ============================================================
//  EDUQUEST — Physics Rapid-Fire
// ============================================================

const physicsQuestions = [
  { q:'SI unit of force?', options:['Joule','Newton','Watt','Pascal'], a:1 },
  { q:'Energy of motion is called?', options:['Potential','Kinetic','Thermal','Electrical'], a:1 },
  { q:'Speed = distance / ?', options:['Power','Time','Mass','Force'], a:1 },
  { q:'1 kilowatt-hour is a unit of?', options:['Power','Energy','Force','Charge'], a:1 },
  { q:'Which travels fastest?', options:['Sound','Water wave','Light','Seismic wave'], a:2 }
];

let phyState = { idx:0, score:0, answering:false, timerId:null, timeLeft:45 };

function initPhysicsRapidFire() {
  if (phyState.timerId) clearInterval(phyState.timerId);
  phyState = { idx:0, score:0, answering:false, timerId:null, timeLeft:45 };
  document.getElementById('physics-score').textContent = '0';
  document.getElementById('physics-time').textContent = '45';
  document.getElementById('physics-complete').style.display = 'none';
  renderPhysicsQuestion();
  phyState.timerId = setInterval(() => {
    phyState.timeLeft--;
    document.getElementById('physics-time').textContent = phyState.timeLeft;
    if (phyState.timeLeft <= 0) { clearInterval(phyState.timerId); completePhysics(); }
  }, 1000);
  document.getElementById('physics-restart').onclick = initPhysicsRapidFire;
}

function renderPhysicsQuestion() {
  const q = physicsQuestions[phyState.idx % physicsQuestions.length];
  document.getElementById('physics-question').textContent = q.q;
  const opts = document.getElementById('physics-options');
  opts.innerHTML = '';
  q.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = text;
    btn.onclick = () => handlePhyAnswer(i, btn, q);
    opts.appendChild(btn);
  });
}

function handlePhyAnswer(choice, btn, q) {
  if (phyState.answering) return;
  phyState.answering = true;
  const opts = document.querySelectorAll('#physics-options .option-btn');
  opts.forEach(b => b.disabled = true);
  if (choice === q.a) {
    btn.classList.add('correct');
    phyState.score += 5;
    document.getElementById('physics-score').textContent = phyState.score;
    incrementDailyGoal(1);
  } else {
    btn.classList.add('incorrect');
    opts[q.a].classList.add('correct');
  }
  setTimeout(() => { phyState.idx++; phyState.answering = false; if (phyState.timeLeft > 0) renderPhysicsQuestion(); }, 700);
}

function completePhysics() {
  userData.points += phyState.score;
  userData.physicsProgress = 100;
  userData.lessonsCompleted++;
  awardBadge('physics');
  logActivity('Completed', 'Physics', `Score ${phyState.score} pts in 45s`);
  saveUserData();
  document.getElementById('physics-complete-text').textContent = `Time's Up! You scored ${phyState.score} points.`;
  document.getElementById('physics-complete').style.display = 'block';
  setTimeout(() => showResults(phyState.score, Math.round(phyState.score/5), physicsQuestions.length, 'physics'), 2000);
}
