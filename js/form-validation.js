// ============================================================
//  EDUQUEST — Form Validation Engine v1.0
//  Centralized, reusable, accessible client-side validation
//  No external dependencies
// ============================================================

const EduValidation = (() => {
  'use strict';

  // ── Regex Patterns ──────────────────────────────────────────
  const PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\d{10}$/,
    name: /^[a-zA-Z\s]+$/,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
  };

  // ── Validators ──────────────────────────────────────────────
  // Each returns { valid: boolean, message: string }

  function isRequired(value, fieldLabel) {
    const v = (value || '').trim();
    return {
      valid: v.length > 0,
      message: `${fieldLabel || 'This field'} is required.`,
    };
  }

  function isValidEmail(value) {
    const v = (value || '').trim();
    if (!v) return { valid: false, message: 'Email address is required.' };
    return {
      valid: PATTERNS.email.test(v),
      message: 'Please enter a valid email address.',
    };
  }

  function isValidPhone(value) {
    const v = (value || '').trim();
    if (!v) return { valid: false, message: 'Phone number is required.' };
    return {
      valid: PATTERNS.phone.test(v),
      message: 'Please enter a valid 10-digit phone number.',
    };
  }

  function isValidName(value) {
    const v = (value || '').trim();
    if (!v) return { valid: false, message: 'Full name is required.' };
    if (v.length < 2) return { valid: false, message: 'Name must be at least 2 characters.' };
    if (v.length > 50) return { valid: false, message: 'Name must not exceed 50 characters.' };
    if (!PATTERNS.name.test(v)) return { valid: false, message: 'Name can only contain letters and spaces.' };
    return { valid: true, message: '' };
  }

  function getPasswordChecks(value) {
    const v = value || '';
    return {
      minLength: v.length >= 8,
      maxLength: v.length <= 64,
      hasUppercase: PATTERNS.hasUppercase.test(v),
      hasLowercase: PATTERNS.hasLowercase.test(v),
      hasNumber: PATTERNS.hasNumber.test(v),
      hasSpecial: PATTERNS.hasSpecial.test(v),
    };
  }

  function isValidPassword(value) {
    const v = value || '';
    if (!v) return { valid: false, message: 'Password is required.' };
    const checks = getPasswordChecks(v);
    if (!checks.minLength) return { valid: false, message: 'Password must be at least 8 characters.' };
    if (!checks.maxLength) return { valid: false, message: 'Password must not exceed 64 characters.' };
    if (!checks.hasUppercase) return { valid: false, message: 'Password must contain at least 1 uppercase letter.' };
    if (!checks.hasLowercase) return { valid: false, message: 'Password must contain at least 1 lowercase letter.' };
    if (!checks.hasNumber) return { valid: false, message: 'Password must contain at least 1 number.' };
    if (!checks.hasSpecial) return { valid: false, message: 'Password must contain at least 1 special character.' };
    return { valid: true, message: '' };
  }

  function doPasswordsMatch(password, confirmPassword) {
    if (!(confirmPassword || '').trim()) return { valid: false, message: 'Please confirm your password.' };
    return {
      valid: password === confirmPassword,
      message: 'Passwords do not match.',
    };
  }

  // ── Password Strength ──────────────────────────────────────
  function getPasswordStrength(value) {
    const v = value || '';
    if (!v) return { score: 0, label: '', percent: 0, level: '' };

    const checks = getPasswordChecks(v);
    let score = 0;
    if (checks.minLength) score++;
    if (checks.hasUppercase) score++;
    if (checks.hasLowercase) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;
    // Bonus for length
    if (v.length >= 12) score++;

    if (score <= 2) return { score, label: 'Weak', percent: 33, level: 'weak' };
    if (score <= 4) return { score, label: 'Medium', percent: 66, level: 'medium' };
    return { score, label: 'Strong', percent: 100, level: 'strong' };
  }

  // ── Field Error Management ─────────────────────────────────

  /**
   * Shows an inline error message below an input and marks the field invalid.
   * Creates the error element if it doesn't already exist.
   */
  function showFieldError(inputEl, message) {
    if (!inputEl) return;
    const field = inputEl.closest('.field');
    if (!field) return;

    // Mark invalid
    field.classList.add('field-invalid');
    inputEl.setAttribute('aria-invalid', 'true');

    // Find or create error span
    let errEl = field.querySelector('.field-error-msg');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error-msg';
      errEl.setAttribute('role', 'alert');
      // Generate unique id for aria-describedby
      const errId = (inputEl.id || 'field') + '-error';
      errEl.id = errId;
      inputEl.setAttribute('aria-describedby', errId);
      // Insert after input (or after password-wrapper if present)
      const wrapper = field.querySelector('.password-wrapper');
      if (wrapper) {
        wrapper.after(errEl);
      } else {
        inputEl.after(errEl);
      }
    }

    errEl.textContent = message;
    errEl.style.display = 'block';

    // Announce to screen readers
    announceError(message);
  }

  /**
   * Clears the error state from a field.
   */
  function clearFieldError(inputEl) {
    if (!inputEl) return;
    const field = inputEl.closest('.field');
    if (!field) return;

    field.classList.remove('field-invalid');
    inputEl.removeAttribute('aria-invalid');

    const errEl = field.querySelector('.field-error-msg');
    if (errEl) {
      errEl.textContent = '';
      errEl.style.display = 'none';
    }
  }

  /**
   * Clears all field errors within a form.
   */
  function clearAllErrors(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('.field-invalid').forEach(f => f.classList.remove('field-invalid'));
    formEl.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    formEl.querySelectorAll('.field-error-msg').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    // Also hide legacy single-error elements
    formEl.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('is-visible');
    });
  }

  // ── Screen Reader Announcements ────────────────────────────
  let _liveRegion = null;

  function getLiveRegion() {
    if (_liveRegion) return _liveRegion;
    _liveRegion = document.getElementById('validation-live-region');
    if (!_liveRegion) {
      _liveRegion = document.createElement('div');
      _liveRegion.id = 'validation-live-region';
      _liveRegion.className = 'sr-only';
      _liveRegion.setAttribute('aria-live', 'assertive');
      _liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(_liveRegion);
    }
    return _liveRegion;
  }

  function announceError(message) {
    const region = getLiveRegion();
    // Force re-announce by clearing first
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }

  // ── Focus First Invalid ────────────────────────────────────
  function focusFirstInvalid(formEl) {
    if (!formEl) return;
    const firstInvalid = formEl.querySelector('.field-invalid input, .field-invalid select');
    if (firstInvalid) {
      firstInvalid.focus();
      // Smooth scroll into view
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ── Submit Button State ────────────────────────────────────
  function setSubmitting(btnEl, isSubmitting) {
    if (!btnEl) return;
    if (isSubmitting) {
      btnEl._originalText = btnEl.textContent;
      btnEl.disabled = true;
      btnEl.textContent = 'Processing…';
      btnEl.classList.add('is-submitting');
    } else {
      btnEl.disabled = false;
      btnEl.textContent = btnEl._originalText || 'Submit';
      btnEl.classList.remove('is-submitting');
    }
  }

  // ── Trim All Inputs ────────────────────────────────────────
  function trimAllInputs(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
      input.value = input.value.trim();
    });
  }

  // ── Live Validation ────────────────────────────────────────
  /**
   * Attaches live validation to an input: clears error when user types valid input.
   * @param {HTMLElement} inputEl
   * @param {Function} validatorFn — receives the input's value, returns { valid, message }
   */
  function attachLiveValidation(inputEl, validatorFn) {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      const field = inputEl.closest('.field');
      // Only clear if field was previously marked invalid
      if (field && field.classList.contains('field-invalid')) {
        const result = validatorFn(inputEl.value);
        if (result.valid) {
          clearFieldError(inputEl);
        }
      }
    });
  }

  // ── Password Visibility Toggle ─────────────────────────────
  /**
   * Creates a show/hide toggle button for a password input.
   * The input must be wrapped in a .password-wrapper container.
   */
  function createPasswordToggle(inputEl) {
    if (!inputEl) return;
    const wrapper = inputEl.closest('.password-wrapper');
    if (!wrapper) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Show password');
    toggleBtn.setAttribute('tabindex', '0');
    toggleBtn.innerHTML = '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';

    let isVisible = false;
    toggleBtn.addEventListener('click', () => {
      isVisible = !isVisible;
      inputEl.type = isVisible ? 'text' : 'password';
      toggleBtn.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
      toggleBtn.innerHTML = isVisible
        ? '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
        : '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    });

    wrapper.appendChild(toggleBtn);
    return toggleBtn;
  }

  // ── Password Strength UI ───────────────────────────────────
  /**
   * Creates and manages the strength indicator + requirements checklist.
   * Returns an updater function to call on each input event.
   */
  function createPasswordStrengthUI(containerEl) {
    if (!containerEl) return () => {};

    // Strength bar
    const strengthWrap = document.createElement('div');
    strengthWrap.className = 'password-strength';
    strengthWrap.innerHTML = `
      <div class="password-strength-track">
        <div class="password-strength-fill"></div>
      </div>
      <span class="password-strength-label"></span>
    `;

    // Requirements checklist
    const reqList = document.createElement('ul');
    reqList.className = 'password-requirements';
    reqList.setAttribute('aria-label', 'Password requirements');
    const requirements = [
      { key: 'minLength', text: 'At least 8 characters' },
      { key: 'hasUppercase', text: '1 uppercase letter' },
      { key: 'hasLowercase', text: '1 lowercase letter' },
      { key: 'hasNumber', text: '1 number' },
      { key: 'hasSpecial', text: '1 special character' },
    ];
    requirements.forEach(req => {
      const li = document.createElement('li');
      li.className = 'password-req-item';
      li.dataset.req = req.key;
      li.innerHTML = `<span class="req-icon">○</span> ${req.text}`;
      reqList.appendChild(li);
    });

    containerEl.appendChild(strengthWrap);
    containerEl.appendChild(reqList);

    const fillEl = strengthWrap.querySelector('.password-strength-fill');
    const labelEl = strengthWrap.querySelector('.password-strength-label');

    // Return updater
    return function updateStrength(value) {
      const strength = getPasswordStrength(value);
      const checks = getPasswordChecks(value);

      // Update bar
      fillEl.style.width = value ? strength.percent + '%' : '0%';
      fillEl.className = 'password-strength-fill' + (strength.level ? ' strength-' + strength.level : '');
      labelEl.textContent = value ? strength.label : '';
      labelEl.className = 'password-strength-label' + (strength.level ? ' strength-' + strength.level : '');

      // Update checklist
      requirements.forEach(req => {
        const li = reqList.querySelector(`[data-req="${req.key}"]`);
        if (!li) return;
        const met = checks[req.key];
        li.classList.toggle('met', met);
        li.querySelector('.req-icon').textContent = met ? '✓' : '○';
      });
    };
  }

  // ── LocalStorage Helpers (shared across auth pages) ────────
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('eduquest_users')) || [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem('eduquest_users', JSON.stringify(users));
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    // Validators
    isRequired,
    isValidEmail,
    isValidPhone,
    isValidName,
    isValidPassword,
    doPasswordsMatch,
    getPasswordChecks,
    getPasswordStrength,

    // Field error management
    showFieldError,
    clearFieldError,
    clearAllErrors,
    focusFirstInvalid,

    // Submit state
    setSubmitting,
    trimAllInputs,

    // Live validation
    attachLiveValidation,

    // Password UX
    createPasswordToggle,
    createPasswordStrengthUI,

    // LocalStorage
    getUsers,
    saveUsers,
  };
})();
