// NAV TOGGLE
function toggleNav() {
  var links = document.querySelector('.nav-links');
  links.classList.toggle('open');
  // Close all dropdowns when nav closes
  document.querySelectorAll('.nav-item').forEach(function(i) {
    i.classList.remove('open');
  });
}

// NAV DROPDOWN — hover on desktop, tap accordion on mobile
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(function (item) {
      var trigger = item.querySelector('a.has-dropdown');
      if (!trigger) return;

      // Create chevron toggle button that sits below the link text
      var chevronBtn = document.createElement('button');
      chevronBtn.setAttribute('aria-label', 'Toggle submenu');
      chevronBtn.className = 'mobile-chevron';
      chevronBtn.innerHTML = '&#8964;';
      // Append chevron after the trigger link, before the dropdown
      trigger.insertAdjacentElement('afterend', chevronBtn);

      // Chevron toggles the dropdown open/closed
      chevronBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var navToggle = document.getElementById('navToggle');
        if (!navToggle) return;
        var isMobile = window.getComputedStyle(navToggle).display !== 'none';
        if (!isMobile) return;
        var isOpen = item.classList.contains('open');
        navItems.forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });

      // Parent link navigates normally on mobile — no preventDefault
      trigger.addEventListener('click', function () {
        var navToggle = document.getElementById('navToggle');
        if (!navToggle) return;
        var isMobile = window.getComputedStyle(navToggle).display !== 'none';
        if (!isMobile) return;
        // Close nav and let the link navigate
        var navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('open');
        navItems.forEach(function (i) { i.classList.remove('open'); });
      });
    });

    // Close all dropdowns when clicking outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item') && !e.target.closest('#navToggle')) {
        navItems.forEach(function (i) { i.classList.remove('open'); });
      }
    });

    // Close nav when any dropdown sub-link or plain link is tapped on mobile
    var navLinks = document.getElementById('navLinks');
    if (navLinks) {
      navLinks.querySelectorAll('.nav-dropdown a, a:not(.has-dropdown)').forEach(function (link) {
        link.addEventListener('click', function () {
          var navToggle = document.getElementById('navToggle');
          if (!navToggle) return;
          var isMobile = window.getComputedStyle(navToggle).display !== 'none';
          if (!isMobile) return;
          navLinks.classList.remove('open');
          navItems.forEach(function (i) { i.classList.remove('open'); });
        });
      });
    }

    // Close dropdowns when hamburger closes the nav
    var navToggleBtn = document.getElementById('navToggle');
    if (navToggleBtn) {
      navToggleBtn.addEventListener('click', function () {
        setTimeout(function () {
          var links = document.getElementById('navLinks');
          if (links && !links.classList.contains('open')) {
            navItems.forEach(function (i) { i.classList.remove('open'); });
          }
        }, 50);
      });
    }
  });
})();

// SOLI WINDOW TOGGLE
function toggleSoli() {
  var win = document.getElementById('soli-window');
  win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'flex' : 'none';
}

// SOLI CONVERSATION HISTORY
var soliMessages = [];

// FIREBASE CLOUD FUNCTION URL
var SOLI_FUNCTION_URL = 'https://us-central1-solid-solutions-today-bc55a.cloudfunctions.net/soli';

// DOM READY
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('soli-input');
  var btn = document.getElementById('soli-send');
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
  }
  if (btn) {
    btn.addEventListener('click', function () { sendMessage(); });
  }
});

// SEND MESSAGE
async function sendMessage() {
  var input = document.getElementById('soli-input');
  var history = document.getElementById('soli-chat-history');
  var message = input.value.trim();
  if (!message) return;

  appendMessage(history, message, 'user');
  input.value = '';
  history.scrollTop = history.scrollHeight;

  soliMessages.push({ role: 'user', content: message });

  var typing = document.createElement('p');
  typing.id = 'soli-typing';
  typing.style.cssText = 'color:#999;font-family:Raleway,sans-serif;font-size:0.85rem;font-style:italic;margin-top:12px;';
  typing.textContent = 'Soli is thinking...';
  history.appendChild(typing);
  history.scrollTop = history.scrollHeight;

  try {
    var response = await fetch(SOLI_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: soliMessages }),
    });

    var data = await response.json();
    var typingEl = document.getElementById('soli-typing');
    if (typingEl) typingEl.remove();

    if (data.reply) {
      soliMessages.push({ role: 'assistant', content: data.reply });
      appendMessage(history, data.reply, 'soli');
    } else {
      appendMessage(history, 'Something went wrong. Please try again.', 'soli');
    }
  } catch (err) {
    var typingEl = document.getElementById('soli-typing');
    if (typingEl) typingEl.remove();
    appendMessage(history, 'Soli is having trouble connecting right now. Please try again shortly.', 'soli');
  }

  history.scrollTop = history.scrollHeight;
}

// APPEND MESSAGE TO CHAT
function appendMessage(history, text, sender) {
  var p = document.createElement('p');
  p.style.cssText = sender === 'user'
    ? 'text-align:right;color:#050d35;font-weight:600;margin-top:12px;font-family:Raleway,sans-serif;font-size:0.95rem;'
    : 'text-align:left;color:#111111;margin-top:12px;font-family:Raleway,sans-serif;font-size:0.95rem;line-height:1.6;';
  if (sender === 'soli') {
    var clean = text.replace(/\*\*/g, '').replace(/\*/g, '');
    var linked = clean.replace(
      /(https?:\/\/[^\s,;:!?"<>]+)/g,
      '<a href="$1" target="_blank" rel="noopener" style="color:#050d35;font-weight:600;text-decoration:underline;">$1</a>'
    );
    linked = linked.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" style="color:#050d35;font-weight:600;text-decoration:underline;">$1</a>'
    );
    p.innerHTML = linked;
  } else {
    p.textContent = text;
  }
  history.appendChild(p);
}

// LOSS CALCULATOR
function calculate() {
  var revenue = parseInt(document.getElementById('revenue').value);
  var online = parseInt(document.getElementById('online').value);
  var visibility = parseInt(document.getElementById('visibility').value);

  document.getElementById('revenue-out').textContent = '$' + revenue.toLocaleString();
  document.getElementById('online-out').textContent = online + '%';
  document.getElementById('visibility-out').textContent = visibility + ' / 10';

  var onlineRevenue = revenue * (online / 100);
  var lost = onlineRevenue * ((10 - visibility) / 10);

  document.getElementById('calc-output').textContent = '$' + Math.round(lost).toLocaleString();
}