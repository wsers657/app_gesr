(() => {
 applyLanguage('fr');
 const rows=[...document.querySelectorAll('[data-subscription]')];
 const checks=[];const check=(name,pass)=>checks.push({name,pass:!!pass});
 check('Five services',rows.length===5);
 for(const row of rows){
  const button=row.querySelector('.manage-sub'),menu=row.querySelector('.manage-menu');
  button.click();
  check(row.dataset.service+' opens',menu.classList.contains('open')&&button.getAttribute('aria-expanded')==='true');
  const r=row.getBoundingClientRect(),b=button.getBoundingClientRect(),m=menu.getBoundingClientRect();
  check(row.dataset.service+' fits',b.left>=r.left&&b.right<=r.right&&m.left>=r.left&&m.right<=r.right&&m.bottom<=r.bottom);
  check(row.dataset.service+' label visible',getComputedStyle(button.querySelector('span')).display!=='none');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check(row.dataset.service+' closes',!menu.classList.contains('open')&&button.getAttribute('aria-expanded')==='false'&&document.activeElement===button);
 }
 rows[0].querySelector('.manage-sub').click();rows[1].querySelector('.manage-sub').click();
 check('Only one open',document.querySelectorAll('.manage-menu.open').length===1);
 document.body.click();
 check('Outside click closes',!document.querySelector('.manage-menu.open'));
 rows[0].querySelector('.manage-sub').click();rows[0].querySelector('.analysis-sub').click();
 check('Analysis opens',!rows[0].querySelector('.plan-recommendation').hidden&&rows[0].querySelector('.manage-sub').getAttribute('aria-expanded')==='false');
 check('No page overflow',document.documentElement.scrollWidth<=innerWidth);
 check('No runtime errors',!window.__auditErrors.length);
 return {width:innerWidth,checks,passed:checks.filter(c=>c.pass).length,total:checks.length};
})()
