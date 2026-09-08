(() => {
  const style=document.createElement('style');style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';document.head.append(style);
  const reports=[],$=s=>document.querySelector(s);
  const route=name=>{history.replaceState({},'',`#${name}`);renderRoute();applyLanguage('fr');};
  const inspect=name=>{
    const overflow=[...document.querySelectorAll('.route-active *')].filter(el=>{
      if (!el.getClientRects().length || !el.textContent.trim() || el.closest('[hidden],[aria-hidden="true"],.hero-visual,.market-scene'))return false;
      const r=el.getBoundingClientRect();return r.width&&(r.left < -2||r.right>innerWidth+2);
    }).slice(0,8).map(el=>({class:el.className,text:el.textContent.slice(0,40)}));
    reports.push({name,overflow});
  };
  route('finance');$('#toggleMemberForm').click();inspect('Add member form');$('#cancelMemberForm')?.click();
  $('.view-member').click();inspect('Member profile');
  route('abonnement');$('.analysis-sub').click();inspect('Subscription analysis');$('.cancel-sub').click();inspect('Cancellation dialog');$('.modal-close').click();
  route('vision');inspect('Pricing and comparator');
  route('demo');$('#resetDemo').click();$('#skipAnalysis').click();$('#continueDemo').click();
  document.querySelectorAll('[data-workspace-tab]').forEach(button=>{button.click();inspect(`Demo ${button.dataset.workspaceTab}`);});
  $('[data-id="netflix"] .view-analysis').click();inspect('Optimization dialog');
  return {width:innerWidth,height:innerHeight,reports};
})()
