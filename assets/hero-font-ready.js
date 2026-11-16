(() => {
  const root = document.documentElement;
  const copy = document.querySelector('.hero-copy');
  const reveal = () => {
    if (copy) copy.hidden = false;
    root.classList.remove('hero-font-pending');
  };

  if (!document.fonts || typeof document.fonts.load !== 'function') {
    reveal();
    return;
  }

  if (document.fonts.check('400 72px "Callonsky Script Web"')) {
    reveal();
    return;
  }

  document.fonts
    .load('400 72px "Callonsky Script Web"')
    .then(reveal)
    .catch(() => {
      reveal();
    });
})();
