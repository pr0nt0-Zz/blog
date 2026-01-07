// ===== Theme Toggle Functionality =====
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Load saved theme (default = dark-mode)
const savedTheme = localStorage.getItem('theme') || 'dark-mode';
if (savedTheme === 'light-mode') {
  htmlElement.classList.add('light-mode');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

// Toggle theme and save preference
themeToggle.addEventListener('click', () => {
  htmlElement.classList.toggle('light-mode');
  const newTheme = htmlElement.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'light-mode' ? '☀️' : '🌙';
});

// ===== Smooth Scrolling for Internal Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href !== '#') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ===== Fade-In Animation on Scroll =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.section, .achievement-card, .note-card').forEach(el => {
  fadeInObserver.observe(el);
});

// ===== Inject Fade-In Keyframes =====
const styleElement = document.createElement('style');
styleElement.textContent = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;
document.head.appendChild(styleElement);
