(() => {
  applyLanguage('fr');
  const button=document.querySelector('.menu-toggle');
  button.click();
  const nav=document.querySelector('.nav'),menu=document.querySelector('.nav-links');
  menu.style.transition='none';menu.style.transform='none';
  return {width:innerWidth,height:innerHeight,nav:nav.getBoundingClientRect().height,menuTop:menu.getBoundingClientRect().top,menuBottom:menu.getBoundingClientRect().bottom,font:getComputedStyle(menu.querySelector('a')).font,links:[...menu.querySelectorAll('a')].map(el=>({text:el.textContent,size:getComputedStyle(el).fontSize,height:el.getBoundingClientRect().height,top:el.getBoundingClientRect().top})),expanded:button.getAttribute('aria-expanded')};
})()
