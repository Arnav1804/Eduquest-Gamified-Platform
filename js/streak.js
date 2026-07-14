// ============================================================
//  EDUQUEST — Daily Streak Tracking
//  Tracks consecutive days a student completes at least one quiz.
//  Persisted via localStorage key: eduquest_streak
// ============================================================

const STREAK_KEY = 'eduquest_streak';

/**
 * Returns today's date as YYYY-MM-DD string (local time).
 */
function _getDateString(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * Returns the date string for yesterday.
 */
function _getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return _getDateString(d);
}

/**
 * Read streak data from localStorage.
 * @returns {{ lastPlayedDate: string|null, currentStreak: number, longestStreak: number }}
 */
function getStreak() {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        lastPlayedDate: data.lastPlayedDate || null,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0
      };
    }
  } catch (e) { /* ignore corrupt data */ }
  return { lastPlayedDate: null, currentStreak: 0, longestStreak: 0 };
}

/**
 * Save streak data to localStorage.
 */
function _saveStreak(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

/**
 * Called after a quiz is completed. Updates the streak:
 * - If already played today → no change (once per day).
 * - If last played yesterday → increment streak.
 * - Otherwise → reset streak to 1.
 * Always updates longestStreak if current exceeds it.
 */
function updateStreakOnQuizComplete() {
  const streak = getStreak();
  const today = _getDateString();
  const yesterday = _getYesterdayString();

  // Already counted today — skip
  if (streak.lastPlayedDate === today) {
    renderStreakUI();
    return;
  }

  if (streak.lastPlayedDate === yesterday) {
    // Consecutive day — increment
    streak.currentStreak += 1;
  } else {
    // Missed a day or first time — reset to 1
    streak.currentStreak = 1;
  }

  streak.lastPlayedDate = today;
  streak.longestStreak = Math.max(streak.currentStreak, streak.longestStreak);

  _saveStreak(streak);
  renderStreakUI();

  // Also update class member data if classroom module is loaded
  if (typeof updateClassMemberData === 'function') {
    updateClassMemberData();
  }
}

/**
 * Updates the streak display in the welcome card.
 * Checks if streak is still valid (not broken by missed days).
 */
function renderStreakUI() {
  const streak = getStreak();
  const today = _getDateString();
  const yesterday = _getYesterdayString();

  // Determine if current streak is still active
  let displayStreak = streak.currentStreak;
  if (streak.lastPlayedDate !== today && streak.lastPlayedDate !== yesterday) {
    // Streak is broken but we don't reset stored data until next quiz
    displayStreak = 0;
  }

  const currentEl = document.getElementById('streak-current-val');
  const longestEl = document.getElementById('streak-longest-val');

  if (currentEl) {
    currentEl.textContent = '🔥 ' + displayStreak;
  }
  if (longestEl) {
    longestEl.textContent = 'Best: ' + streak.longestStreak;
  }
}
