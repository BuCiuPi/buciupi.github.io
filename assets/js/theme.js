'use strict';

// Loaded in <head> so the saved theme applies before first paint.
(function () {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;

  function savedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function updateToggles(theme) {
    const nextLabel = theme === 'dark' ? 'Light' : 'Dark';
    document.querySelectorAll('[data-theme-label]').forEach(label => {
      // Only write on change: the observer below watches this text too.
      if (label.textContent !== nextLabel) label.textContent = nextLabel;
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    updateToggles(theme);
  }

  applyTheme(savedTheme() || systemTheme());

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-theme-toggle]')) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode: not persisted */ }
    applyTheme(next);
  });

  // Follow the system until the visitor picks a theme.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!savedTheme()) applyTheme(systemTheme());
  });

  // Project pages have no hero, so they get the CV's slim running head.
  function addRunningHead() {
    if (!location.pathname.includes('/assets/projects/')) return;
    document.body.insertAdjacentHTML('afterbegin', `
      <header class="run-head">
        <div class="run-head-inner">
          <a class="run-head-name" href="../../index.html#portfolio">
            <strong>LONG NGUYEN</strong>
            <span>Technical Artist &amp; Game Developer</span>
          </a>
          <div class="run-head-actions">
            <a class="run-head-back" href="../../index.html#portfolio">All projects</a>
            <button class="theme-toggle" type="button" data-theme-toggle>
              <span class="theme-toggle-label" data-theme-label></span>
            </button>
          </div>
        </div>
        <div class="ramp" aria-hidden="true"></div>
      </header>`);
    updateToggles(root.dataset.theme);
  }

  document.addEventListener('DOMContentLoaded', addRunningHead);

  // The active tab's tail hides while the bar is stuck to the top of the page.
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('is-stuck', navbar.getBoundingClientRect().top <= 0);
  }, { passive: true });

  // The hero partial loads after this script, so label it once it arrives.
  new MutationObserver(() => updateToggles(root.dataset.theme))
    .observe(root, { childList: true, subtree: true });
})();
