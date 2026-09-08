(() => {
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  return {route:document.body.dataset.route,width:innerWidth,scroll:document.documentElement.scrollWidth,title:document.title,
    overflow:[...document.querySelectorAll('main .route-active *')].filter(el => {
      if (!visible(el) || el.closest('[aria-hidden="true"],.hero-visual,.route-hero,.market-scene')) return false;
      const r=el.getBoundingClientRect(); return r.width && (r.right>innerWidth+2 || r.left < -2);
    }).slice(0,15).map(el => ({class:el.className,text:el.textContent.trim().slice(0,60),width:Math.round(el.getBoundingClientRect().width)}))};
})()
