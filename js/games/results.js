// ============================================================
//  EDUQUEST — Game Results Screen
// ============================================================

function showResults(score, correct, total, badge) {
  document.getElementById('final-score').textContent = score;
  document.getElementById('correct-answers').textContent = correct;
  document.getElementById('total-questions').textContent = total;

  const pct = total > 0 ? correct / total : 0;
  let emoji = '😊', title = 'Good effort!', subtitle = 'Keep practicing to improve.';
  if (pct >= 0.8) { emoji='🏆'; title='Outstanding!'; subtitle='You\'re a true champion!'; }
  else if (pct >= 0.6) { emoji='⭐'; title='Great job!'; subtitle='You\'re doing really well!'; }

  document.getElementById('results-emoji').textContent = emoji;
  document.getElementById('results-title').textContent = title;
  document.getElementById('results-subtitle').textContent = subtitle;

  const badgeBox = document.getElementById('badge-earned');
  if (badge && (userData.badges||[]).includes(badge)) {
    const badgeNames = { math_master:'Math Master', math:'Math Whiz', science:'Science Explorer', memory:'Memory Master', geometry:'Geo Pro', physics:'Physics Ace' };
    document.getElementById('badge-name').textContent = badgeNames[badge] || badge;
    badgeBox.classList.remove('hidden');
  } else {
    badgeBox.classList.add('hidden');
  }

  document.getElementById('game-active-area').style.display = 'none';
  document.getElementById('game-start-screen').style.display = 'none';
  document.getElementById('results-screen').classList.add('active');

  updateDashboard();
}
