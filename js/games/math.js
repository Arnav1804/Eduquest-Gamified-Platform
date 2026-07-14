// ============================================================
//  EDUQUEST — Math Quiz
// ============================================================

const mathQuestions = [
  { question:"What is 7 × 8?", options:["54","56","64","72"], answer:1 },
  { question:"Solve: 15 + 23", options:["38","37","36","35"], answer:0 },
  { question:"What is ¾ of 20?", options:["12","15","10","5"], answer:1 },
  { question:"Calculate: 5² + 3³", options:["32","34","52","54"], answer:2 },
  { question:"If x = 5, what is 2x + 3?", options:["10","13","15","18"], answer:1 },
  { question:"What is the square root of 144?", options:["12","14","16","18"], answer:0 },
  { question:"Solve: 45 ÷ 9", options:["4","5","6","7"], answer:1 },
  { question:"What is 30% of 50?", options:["10","15","20","25"], answer:1 },
  { question:"Calculate: 7 × 6 - 8", options:["34","36","38","40"], answer:0 },
  { question:"What is the next number: 2, 4, 8, 16, ?", options:["24","28","32","36"], answer:2 }
];

let mathState = { questions:[], idx:0, score:0, timer:60, timerInterval:null, correctAnswers:0 };

function initMathQuiz() {
  mathState = { questions: [...mathQuestions].sort(() => Math.random()-0.5), idx:0, score:0, timer:60, timerInterval:null, correctAnswers:0 };
  document.getElementById('game-score').textContent = '0';
  document.getElementById('game-timer').textContent = '60';
  startMathTimer();
  loadMathQuestion();
}

function loadMathQuestion() {
  if (mathState.idx >= mathState.questions.length) { endMathGame(); return; }
  const q = mathState.questions[mathState.idx];
  document.getElementById('math-question').textContent = q.question;
  document.getElementById('math-q-num').textContent = `Question ${mathState.idx+1} of ${mathState.questions.length}`;
  document.getElementById('game-progress-fill').style.width = ((mathState.idx / mathState.questions.length) * 100) + '%';
  const opts = document.getElementById('math-options');
  opts.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.dataset.index = i;
    opts.appendChild(btn);
  });
  const fb = document.getElementById('math-feedback');
  fb.style.display = 'none'; fb.className = 'game-feedback';
}

function handleMathAnswer(selectedIndex) {
  const q = mathState.questions[mathState.idx];
  const options = document.querySelectorAll('#math-options .option-btn');
  const fb = document.getElementById('math-feedback');
  options.forEach(b => b.disabled = true);

  if (selectedIndex === q.answer) {
    options[selectedIndex].classList.add('correct');
    fb.textContent = '✓ Correct! +10 points';
    fb.className = 'game-feedback correct';
    mathState.score += 10;
    mathState.correctAnswers++;
    document.getElementById('game-score').textContent = mathState.score;
    incrementDailyGoal(1);
  } else {
    options[selectedIndex].classList.add('incorrect');
    options[q.answer].classList.add('correct');
    fb.textContent = `✗ Incorrect! Answer: ${q.options[q.answer]}`;
    fb.className = 'game-feedback incorrect';
  }
  fb.style.display = 'block';
  setTimeout(() => { mathState.idx++; loadMathQuestion(); }, 1500);
}

function startMathTimer() {
  clearInterval(mathState.timerInterval);
  mathState.timerInterval = setInterval(() => {
    mathState.timer--;
    document.getElementById('game-timer').textContent = mathState.timer;
    if (mathState.timer <= 0) endMathGame();
  }, 1000);
}

function endMathGame() {
  clearInterval(mathState.timerInterval);
  userData.points += mathState.score;
  userData.mathProgress = 100;
  userData.lessonsCompleted++;
  const badge = mathState.correctAnswers >= mathState.questions.length * 0.8 ? 'math_master' : 'math';
  awardBadge(badge);
  setSubjectScore('math', Math.round((mathState.correctAnswers / mathState.questions.length) * 100));
  logActivity('Completed', 'Math', `Score ${mathState.score}`);
  saveUserData();
  showResults(mathState.score, mathState.correctAnswers, mathState.questions.length, badge);
}
