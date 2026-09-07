(() => {
  const model = window.KotizDemo;
  const root = document.querySelector('#productDemo');
  if (!root || !model) return;
  const $ = selector => root.querySelector(selector);
  const money = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',minimumFractionDigits:2}).format(value);
  const labels = { optimization_available:'Optimisation détectée', optimized:'Déjà optimisé', review:'À surveiller', unused:'Peu utilisé' };
  const tripTarget = 2200;
  let items = model.reset(), realized = 0, guideStep = 0, analysisTimers = [], lastFocus = null, householdSpent = 2517, goalSaved = 1240, householdSavings = 13660, savingsAllocated = false;

  function render() {
    const totals = model.totals(items);
    $('#activeSubscriptions').textContent = totals.active;
    $('#monthlySpendDemo').textContent = money(totals.monthly);
    $('#monthlyPotential').textContent = money(totals.potential);
    $('#annualPotential').textContent = money((realized || totals.potential) * 12);
    $('#annualLabel').textContent = realized ? 'ÉCONOMIE ANNUELLE RÉALISÉE' : 'ÉCONOMIE ANNUELLE POSSIBLE';
    $('#annualCaption').textContent = realized ? 'intégrée à votre nouveau budget' : 'détectée selon votre usage';
    $('#realizedSavings').textContent = money(realized);
    $('#monthlySpendBefore').textContent = realized ? `${money(totals.monthly + realized)} avant optimisation` : 'avant optimisation';
    $('#demoSubscriptions').innerHTML = items.map(item => `<article class="demo-sub-card status-${item.status}${item.id==='netflix'&&!item.optimized?' featured-sub':''}" data-id="${item.id}">
      <div class="demo-card-top"><img src="${item.logo}" alt=""><span class="status-badge">${item.optimized?'Formule adaptée':labels[item.status]}</span></div>
      <div><h4>${item.service}</h4><p>${item.plan}</p></div><strong>${money(item.price)} <small>${item.billing==='four_weeks'?'/ 4 semaines':'/ mois'}</small></strong>
      <div class="usage-row"><span>UTILISATION</span><b>${item.usage.label}</b><i><span style="width:${item.usage.score}%"></span></i></div>
      <button type="button" class="view-analysis">Voir l’analyse <span>→</span></button></article>`).join('');
    root.classList.toggle('demo-optimized', realized > 0);
  }

  function startAnalysis() {
    analysisTimers.forEach(clearTimeout); analysisTimers=[];
    $('#demoDashboard').hidden=true; $('#demoAnalysis').hidden=false; $('#analysisProgress').style.width='0';
    const analysisLabels=['Abonnements détectés','Dépenses analysées','Usage comparé aux formules disponibles','Opportunités d’économies identifiées'];
    [...$('#analysisSteps').children].forEach((li,index)=>{li.classList.remove('done');li.textContent=analysisLabels[index];});
    requestAnimationFrame(()=>$('#analysisProgress').style.width='100%');
    [...$('#analysisSteps').children].forEach((li,index)=>analysisTimers.push(setTimeout(()=>{li.classList.add('done');li.insertAdjacentText('afterbegin','✓ ');},450+index*480)));
    analysisTimers.push(setTimeout(showDashboard,2450));
  }
  function showDashboard(){ analysisTimers.forEach(clearTimeout); $('#demoAnalysis').hidden=true; $('#demoDashboard').hidden=false; render(); }
  function openDrawer(item) {
    lastFocus=document.activeElement; const saving=model.monthlySaving(item); const rec=item.availablePlans.find(plan=>plan.name===item.recommendedPlan);
    const canOptimize=Boolean(rec && saving);
    $('#drawerContent').innerHTML=`<span class="drawer-eyebrow">ANALYSE D’USAGE · ${item.service.toUpperCase()}</span><h2 id="drawerTitle">${canOptimize?'Votre formule semble surdimensionnée.':item.status==='review'?'Encore un peu de données nécessaires.':'Votre formule est bien adaptée.'}</h2><p class="drawer-reason">${item.reason}</p><div class="drawer-usage"><span>USAGE OBSERVÉ</span><strong>${item.usage.label}</strong><p>${item.usage.detail}</p></div>${canOptimize?`<div class="plan-compare"><div><span>FORMULE ACTUELLE</span><strong>${item.plan}</strong><b>${money(item.price)} / mois</b></div><i>→</i><div class="recommended-plan"><span>FORMULE RECOMMANDÉE</span><strong>${rec.name}</strong><b>${money(rec.price)} / mois</b></div></div><div class="drawer-saving"><span>ÉCONOMIE ESTIMÉE</span><strong>${money(saving)} / mois</strong><b>soit ${money(saving*12)} / an</b></div><button class="apply-optimization" data-id="${item.id}" type="button">Passer à l’offre recommandée <span>→</span></button>`:`<div class="no-action"><span>✓</span><div><strong>${item.status==='review'?'Recommandation mise en attente':'Aucune optimisation nécessaire'}</strong><p>Économie potentielle : 0 €</p></div></div>`}`;
    $('#demoDrawer').hidden=false; document.body.classList.add('drawer-open'); $('.drawer-close').focus();
  }
  function closeDrawer(){ $('#demoDrawer').hidden=true; document.body.classList.remove('drawer-open'); lastFocus?.focus(); }
  function optimize(id){ const before=model.totals(items).monthly; items=model.applyOptimization(items,id); const after=model.totals(items).monthly; realized+=before-after; closeDrawer(); render(); $('#demoResult').hidden=false; $('#resultBefore').textContent=money(before); $('#resultAfter').textContent=money(after); $('#resultSaving').textContent=`${money(realized)} / mois`; $('#resultAnnual').textContent=`${money(realized*12)} / an`; $('#demoResult').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'}); guideStep=2; updateGuide(); }
  const guide=[['Vos dépenses','Nous avons identifié vos paiements récurrents.'],['Une optimisation détectée','Netflix Premium dépasse votre usage réel. Ouvrez son analyse.'],['Votre économie','Le budget se met à jour dès que la décision est appliquée.'],['Votre espace financier','Explorez librement budget, répartition, objectifs et insights.'],['Un copilote complet','Kotiz relie toutes les décisions financières du foyer.']];
  function updateGuide(){ $('#guideCounter').textContent=`DÉMO · ${guideStep+1}/5`; $('#guideTitle').textContent=guide[guideStep][0]; $('#guideText').textContent=guide[guideStep][1]; $('#guideNext').textContent=guideStep===1?'Ouvrir Netflix →':guideStep===2?'Ouvrir le cockpit →':guideStep===3?'Voir la conclusion →':guideStep===4?'Terminer':'Suivant →'; document.querySelector('[data-id="netflix"]')?.classList.toggle('guide-focus',guideStep===1); }
  function selectWorkspaceTab(name){ root.querySelectorAll('[data-workspace-tab]').forEach(button=>button.classList.toggle('active',button.dataset.workspaceTab===name));root.querySelectorAll('[data-workspace-panel]').forEach(panel=>{panel.hidden=panel.dataset.workspacePanel!==name;panel.classList.toggle('active',panel.dataset.workspacePanel===name);}); }
  function renderGoal(){const percent=Math.round(goalSaved/tripTarget*100);$('#goalSaved').textContent=money(goalSaved);$('#goalPercent').textContent=`${percent} % atteint`;$('#goalProgress').style.width=`${percent}%`;$('#goalRemaining').textContent=`${money(Math.max(0,tripTarget-goalSaved))} restants`;$('#householdSavings').textContent=money(householdSavings);$('#overviewGoal').textContent=`Saint-Tropez · ${percent} % financé`;$('#netflixGoalAmount').textContent=savingsAllocated?'7 € / mois vers Saint-Tropez':'7 € / mois disponibles';$('#netflixGoalStatus').textContent=savingsAllocated?'Économie Netflix affectée automatiquement':'Économie Netflix à affecter';$('#allocationBadge').textContent=savingsAllocated?'ACTIF':'À ACTIVER';$('#allocationBadge').classList.toggle('active',savingsAllocated);$('#goalForecast').textContent=savingsAllocated?'Mars 2028':'Décembre 2028';$('#forecastDetail').textContent=savingsAllocated?'Le voyage se finance 9 mois plus tôt grâce aux économies récurrentes.':'Avec le virement actuel de 25 € par mois.';}
  function allocateNetflixSavings(){if(savingsAllocated||!realized)return;savingsAllocated=true;goalSaved+=realized;householdSavings+=realized;renderGoal();$('#allocateSavings').disabled=true;$('#allocateSavings').textContent='✓ 7 € / mois affectés';$('#savingAllocation').classList.add('allocated');$('#goalFeedback').textContent='✓ Premier versement ajouté. Les 7 € économisés seront transférés chaque mois.';setTimeout(()=>{showWorkspace();selectWorkspaceTab('goals');},550);}
  function showWorkspace(){ $('#demoWorkspace').hidden=false; guideStep=3; updateGuide(); selectWorkspaceTab('overview'); $('#demoWorkspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); }
  function showFinale(){const finale=$('#demoFinale');finale.hidden=false;finale.classList.remove('finale-enter');void finale.offsetWidth;finale.classList.add('finale-enter');guideStep=4;updateGuide();finale.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  function resetWorkspace(){ householdSpent=2517;goalSaved=1240;householdSavings=13660;savingsAllocated=false;$('#householdSpent').textContent=money(householdSpent);$('#availableBudget').textContent=money(3500-householdSpent);$('#budgetPercent').textContent=`${Math.round(householdSpent/3500*100)} % utilisé`;$('#expenseForm').hidden=true;$('#expenseFeedback').textContent='';$('#goalFeedback').textContent='Activez l’économie Netflix pour accélérer cet objectif.';$('#allocateSavings').disabled=false;$('#allocateSavings').textContent='Ajouter au voyage →';$('#savingAllocation').classList.remove('allocated');renderGoal();root.querySelectorAll('.resolved-insight').forEach(item=>item.hidden=true);root.querySelectorAll('.resolveInsight').forEach(button=>{button.disabled=false;button.textContent=button.dataset.originalText||button.textContent;});selectWorkspaceTab('overview');}
  function reset(){ items=model.reset(); realized=0; guideStep=0; $('#demoResult').hidden=true; $('#demoWorkspace').hidden=true; $('#demoFinale').hidden=true; $('#demoFinale').classList.remove('finale-enter');$('#demoGuide').hidden=false; resetWorkspace(); render(); updateGuide(); closeDrawer(); startAnalysis(); }
  $('#skipAnalysis').addEventListener('click',showDashboard);
  $('#resetDemo').addEventListener('click',reset);
  $('#skipGuide').addEventListener('click',()=>$('#demoGuide').hidden=true);
  $('#guideNext').addEventListener('click',()=>{ if(guideStep===0){guideStep=1;updateGuide();document.querySelector('[data-id="netflix"]')?.scrollIntoView({behavior:'smooth',block:'center'});}else if(guideStep===1){openDrawer(items.find(item=>item.id==='netflix'));}else if(guideStep===2){showWorkspace();}else if(guideStep===3){showFinale();}else $('#demoGuide').hidden=true; });
  $('#continueDemo').addEventListener('click',showWorkspace);
  $('#allocateSavings').addEventListener('click',allocateNetflixSavings);
  $('#finishDemo').addEventListener('click',showFinale);
  $('#replayFinale').addEventListener('click',reset);
  root.querySelectorAll('[data-workspace-tab]').forEach(button=>button.addEventListener('click',()=>selectWorkspaceTab(button.dataset.workspaceTab)));
  root.querySelectorAll('[data-open-module]').forEach(button=>button.addEventListener('click',()=>selectWorkspaceTab(button.dataset.openModule)));
  $('#toggleExpense').addEventListener('click',()=>{$('#expenseForm').hidden=!$('#expenseForm').hidden;if(!$('#expenseForm').hidden)$('#expenseLabel').focus();});
  $('#expenseForm').addEventListener('submit',event=>{event.preventDefault();const amount=Number($('#expenseValue').value);if(!amount||amount<0)return;const article=document.createElement('article');const icon=document.createElement('i');icon.className='food';icon.textContent='＋';const title=document.createElement('strong');title.textContent=$('#expenseLabel').value;const small=document.createElement('small');small.textContent='Ajout manuel · Démo';title.append(small);const category=document.createElement('span');category.textContent=$('#expenseCategory').value;const date=document.createElement('span');date.textContent='À l’instant';const price=document.createElement('b');price.textContent=`−${money(amount)}`;article.append(icon,title,category,date,price);$('#workspaceTransactions').prepend(article);householdSpent+=amount;$('#householdSpent').textContent=money(householdSpent);$('#availableBudget').textContent=money(3500-householdSpent);$('#budgetPercent').textContent=`${Math.round(householdSpent/3500*100)} % utilisé`;$('#expenseFeedback').textContent=`✓ ${money(amount)} ajouté au budget du foyer.`;$('#expenseForm').hidden=true;});
  $('#calculateSplit').addEventListener('click',()=>{const amount=Math.max(0,Number($('#splitAmount').value)||0);const method=root.querySelector('input[name="splitMethod"]:checked').value;const julieRate=method==='equal'?.5:.58;$('#julieShare').textContent=money(amount*julieRate);$('#thomasShare').textContent=money(amount*(1-julieRate));$('#splitMessage').textContent=method==='equal'?'La dépense est répartie à parts égales.':'La contribution est calculée selon les revenus du foyer.';});
  $('#addToGoal').addEventListener('click',()=>{const contribution=Math.min(50,tripTarget-goalSaved);goalSaved+=contribution;householdSavings+=contribution;renderGoal();$('#goalFeedback').textContent=`✓ ${money(contribution)} ajoutés. Il reste ${money(tripTarget-goalSaved)} à épargner.`;});
  root.querySelectorAll('.resolveInsight').forEach(button=>{button.dataset.originalText=button.textContent;button.addEventListener('click',()=>{root.querySelector('.resolved-insight').hidden=false;$('#insightConfirmation').textContent=button.textContent.includes('35')?'Virement mensuel de 35 € programmé.':'Comparaison énergétique ajoutée à vos actions.';button.textContent='✓ Action enregistrée';button.disabled=true;});});
  $('#demoSubscriptions').addEventListener('click',event=>{const button=event.target.closest('.view-analysis');if(button)openDrawer(items.find(item=>item.id===button.closest('[data-id]').dataset.id));});
  $('#demoDrawer').addEventListener('click',event=>{if(event.target.closest('.drawer-close,.drawer-backdrop'))closeDrawer();const button=event.target.closest('.apply-optimization');if(button)optimize(button.dataset.id);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#demoDrawer').hidden)closeDrawer();});
  window.addEventListener('hashchange',()=>{if(location.hash.split('/')[0]==='#demo')reset();else analysisTimers.forEach(clearTimeout);});
  if(location.hash.split('/')[0]==='#demo') reset(); else render();
})();
