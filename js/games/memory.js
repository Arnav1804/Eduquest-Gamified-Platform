// ============================================================
//  EDUQUEST — Memory Match
// ============================================================

const vocabularyPairs = [
  { id:'amiable',     front:'Amiable',     match:'Friendly or pleasant' },
  { id:'meticulous',  front:'Meticulous',  match:'Very careful and precise' },
  { id:'innovate',    front:'Innovate',    match:'Introduce new ideas or methods' },
  { id:'vivid',       front:'Vivid',       match:'Bright, clear, and detailed' },
  { id:'empathy',     front:'Empathy',     match:"Understanding others' feelings" },
  { id:'resilient',   front:'Resilient',   match:'Able to recover quickly' },
  { id:'chronology',  front:'Chronology',  match:'Order of events in time' },
  { id:'artifact',    front:'Artifact',    match:'Object from the past made by people' },
  { id:'habitat',     front:'Habitat',     match:'Natural home of an organism' },
  { id:'perimeter',   front:'Perimeter',   match:'Distance around a shape' }
];

let memState = { firstCard:null, lockBoard:false, moves:0, matches:0 };

function initMemoryGame() {
  memState = { firstCard:null, lockBoard:false, moves:0, matches:0 };
  document.getElementById('memory-moves').textContent = '0';
  document.getElementById('memory-matches').textContent = '0';
  document.getElementById('memory-complete').style.display = 'none';
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';

  const deck = [];
  vocabularyPairs.forEach(p => {
    deck.push({ key:p.id, type:'word', text:p.front });
    deck.push({ key:p.id, type:'def',  text:p.match });
  });
  for (let i = deck.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  deck.forEach(card => {
    const el = document.createElement('button');
    el.className = `memory-card ${card.type === 'word' ? 'is-word' : 'is-def'}`;
    el.dataset.key = card.key;
    el.dataset.type = card.type;
    el.innerHTML = `<span class="card-front">${card.text}</span><span class="card-back">?</span>`;
    el.addEventListener('click', () => flipMemCard(el));
    grid.appendChild(el);
  });
  document.getElementById('memory-restart').onclick = initMemoryGame;
}

function flipMemCard(el) {
  if (memState.lockBoard || el.classList.contains('matched') || el === memState.firstCard) return;
  el.classList.add('flipped');
  if (!memState.firstCard) { memState.firstCard = el; return; }
  memState.moves++;
  document.getElementById('memory-moves').textContent = memState.moves;
  const isMatch = el.dataset.key === memState.firstCard.dataset.key && el.dataset.type !== memState.firstCard.dataset.type;
  if (isMatch) {
    el.classList.add('matched');
    memState.firstCard.classList.add('matched');
    memState.matches++;
    document.getElementById('memory-matches').textContent = memState.matches;
    showMatchCheck(memState.firstCard, el);
    memState.firstCard = null;
    if (memState.matches === vocabularyPairs.length) {
      userData.points += 20;
      userData.memoryProgress = 100;
      userData.lessonsCompleted++;
      awardBadge('memory');
      logActivity('Completed', 'Memory', `Matched all pairs in ${memState.moves} moves`);
      saveUserData();
      document.getElementById('memory-feedback-text').textContent = `All matched in ${memState.moves} moves! +20 bonus points 🎉`;
      document.getElementById('memory-complete').style.display = 'block';
      setTimeout(() => showResults(20, vocabularyPairs.length, vocabularyPairs.length, 'memory'), 2500);
    }
  } else {
    memState.lockBoard = true;
    setTimeout(() => { el.classList.remove('flipped'); memState.firstCard.classList.remove('flipped'); memState.firstCard=null; memState.lockBoard=false; }, 850);
  }
}

function showMatchCheck(a, b) {
  const check = document.getElementById('match-checkmark');
  const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  check.style.left = ((ra.left+ra.right+rb.left+rb.right)/4) + 'px';
  check.style.top  = ((ra.top+ra.bottom+rb.top+rb.bottom)/4)  + 'px';
  check.classList.add('show');
  setTimeout(() => check.classList.remove('show'), 700);
}
