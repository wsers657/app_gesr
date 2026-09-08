(() => {
  applyLanguage('fr');
  const button=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav-links'),main=document.querySelector('main');
  const checks=[];const check=(name,pass)=>checks.push({name,pass:Boolean(pass)});
  check('Closed menu excluded from keyboard navigation',nav.inert);
  button.click();
  check('Menu opens',button.getAttribute('aria-expanded')==='true'&&!nav.inert);
  check('Content behind menu cannot receive focus',main.inert);
  check('First menu link receives focus',document.activeElement===nav.querySelector('a'));
  check('Readable menu typography',parseFloat(getComputedStyle(nav.querySelector('a')).fontSize)>=20);
  check('Touch targets at least 44px',[...nav.querySelectorAll('a')].every(a=>a.getBoundingClientRect().height>=44));
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check('Escape closes and returns focus',button.getAttribute('aria-expanded')==='false'&&document.activeElement===button);
  check('Content restored after closing',!main.inert&&nav.inert);
  return {width:innerWidth,height:innerHeight,passed:checks.filter(c=>c.pass).length,total:checks.length,checks};
})()
