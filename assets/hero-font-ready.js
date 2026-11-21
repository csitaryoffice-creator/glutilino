(() => {
  const root = document.documentElement;
  const copy = document.querySelector('.hero-copy');
  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    if (copy) copy.hidden = false;
    root.classList.remove('hero-font-pending');
  };

  // Never leave the hero hidden if a production font request stalls.
  const fallback = window.setTimeout(reveal, 350);
  const revealAndClear = () => {
    window.clearTimeout(fallback);
    reveal();
  };

  if (!document.fonts || typeof document.fonts.load !== 'function') {
    revealAndClear();
    return;
  }

  if (document.fonts.check('400 72px "Callonsky Script Web"')) {
    revealAndClear();
    return;
  }

  document.fonts
    .load('400 72px "Callonsky Script Web"')
    .then(revealAndClear)
    .catch(revealAndClear);
})();
