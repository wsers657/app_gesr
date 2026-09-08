(() => {
  const checks=[];
  const check=(name,pass,detail)=>checks.push({name,pass:Boolean(pass),...(detail===undefined?{}:{detail})});
  const $=s=>document.querySelector(s);
  const route=name=>{history.replaceState({},'',`#${name}`);renderRoute();applyLanguage('fr');};
  const m=window.KotizPricing;
  check('No startup errors',Array.isArray(window.__auditErrors)&&!window.__auditErrors.length,window.__auditErrors);
  check('Share: zero savings, zero fee',m.annualCost('share',0)===0);
  check('Share: 10% of savings',m.annualCost('share',300)===30);
  check('Share: annual cap',m.annualCost('share',2400)===120);
  check('Plus: annual price',Math.abs(m.annualCost('plus',0)-71.88)<.0001);
  check('Recommendation threshold',m.recommendation(700)==='share'&&m.recommendation(725)==='plus');
  route('vision');
  $('#pricingSavings').value='2400';$('#pricingSavings').dispatchEvent(new Event('input'));
  check('Comparator updates cap', $('#shareAnnualCost').textContent.includes('120'));
  $('[data-select-plan="plus"]').click();
  check('Select Plus', $('[data-select-plan="plus"]').getAttribute('aria-pressed')==='true');
  applyLanguage('en');
  check('Plan and recommendation translate', $('[data-select-plan="plus"]').textContent.includes('Selected') && $('#pricingRecommendation').textContent.includes('better value'));
  applyLanguage('fr');
  check('Selection survives language change', $('[data-pricing-plan="plus"]').classList.contains('selected'));
  for(const name of ['','unknown','product','offers','subscriptions','demo']){
    route(name);check(`Valid title for #${name}`,document.title&&!document.title.includes('undefined'));
  }
  route('abonnement');
  const row=$('[data-subscription]');
  row.querySelector('.pause-sub').click();
  applyLanguage('fr');
  check('Pause survives translation',row.dataset.state==='paused' && row.querySelector('.pause-sub').textContent.includes('Reprendre'));
  row.querySelector('.pause-sub').click();
  row.querySelector('.cancel-sub').click();
  check('Dialog receives focus',document.activeElement===$('.modal-close'));
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check('Escape closes cancellation dialog',!$('#cancelModal').classList.contains('open'));
  route('finance');
  const membersBefore=$$('#familyMemberList [data-member-id]').length;
  function $$(s){return [...document.querySelectorAll(s)];}
  $('#memberName').value='<b>Test</b>';
  $('#memberForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  check('Member added', $$('#familyMemberList [data-member-id]').length===membersBefore+1);
  check('Member name escaped',!$('#familyMemberList').innerHTML.includes('<b>Test</b>'));
  route('demo');$('#resetDemo').click();$('#skipAnalysis').click();
  const initialTransactions=$$('#workspaceTransactions article').length;
  $('#expenseLabel').value='Test expense';$('#expenseValue').value='42.80';
  $('#expenseForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  check('Expense added',$$('#workspaceTransactions article').length===initialTransactions+1);
  $('#resetDemo').click();$('#skipAnalysis').click();
  check('Reset removes added transactions',$$('#workspaceTransactions article').length===initialTransactions);
  const optimize=id=>{$(`[data-id="${id}"] .view-analysis`).click();$('.apply-optimization').click();};
  $('[data-id="icloud"] .view-analysis').click();
  check('Suitable plan has no optimization action',!$('.apply-optimization'));
  $('.drawer-close').click();
  $('#allocateSavings').click();
  check('Allocation requires Netflix optimization', !$('#savingAllocation').classList.contains('allocated'));
  optimize('netflix');$('#allocateSavings').click();
  check('Netflix allocation is exactly 7 euros',$('#goalSaved').textContent.replace(/\s/g,'').startsWith('1247,'));
  check('No runtime errors',Array.isArray(window.__auditErrors)&&!window.__auditErrors.length,window.__auditErrors);
  return {passed:checks.filter(c=>c.pass).length,total:checks.length,checks};
})()
