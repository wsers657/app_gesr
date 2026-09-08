(() => {
  const reports = [];
  for (const language of ['fr', 'en']) {
    applyLanguage(language);
    for (const route of ['home', 'finance', 'savings', 'abonnement', 'vision', 'demo']) {
      history.replaceState({}, '', '#' + route);
      renderRoute();
      applyLanguage(language);
      document.querySelectorAll('.route-active .reveal').forEach(el => el.classList.add('visible'));
      document.querySelectorAll('.route-hero').forEach(el => el.style.animation = 'none');
      if (route === 'demo') {
        document.querySelector('#skipAnalysis')?.click();
      }
      const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
      const overflow = [...document.querySelectorAll('main .route-active *')].filter(el => {
        if (!visible(el) || el.closest('[aria-hidden="true"]')) return false;
        const r = el.getBoundingClientRect();
        return el.textContent.trim() && r.width && (r.right > innerWidth + 2 || r.left < -2) && !el.closest('.hero-visual,.market-scene');
      }).slice(0, 12).map(el => ({tag:el.tagName, class:el.className, text:el.textContent.trim().slice(0,60), width:Math.round(el.getBoundingClientRect().width)}));
      reports.push({route,language,width:innerWidth,scroll:document.documentElement.scrollWidth,title:document.title,overflow,
        brokenImages:[...document.images].filter(el => visible(el) && el.complete && !el.naturalWidth).map(el => el.getAttribute('src')),
        unnamedButtons:[...document.querySelectorAll('button')].filter(el => visible(el) && !el.textContent.trim() && !el.getAttribute('aria-label')).map(el => el.id || el.className)});
    }
  }
  return reports;
})()
