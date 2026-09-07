(() => {
  const model = window.KotizPricing;
  if (!model) return;
  const money = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',minimumFractionDigits:2}).format(value);
  const roundMoney = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
  const slider = document.querySelector('#pricingSavings');
  const selectedPlan = () => {
    try { return localStorage.getItem('kotiz-demo-plan') || 'share'; }
    catch { return 'share'; }
  };
  const savePlan = planId => {
    try { localStorage.setItem('kotiz-demo-plan', planId); }
    catch { /* The demo remains functional when storage is unavailable. */ }
  };

  function renderComparison() {
    if (!slider) return;
    const savings = Number(slider.value);
    const shareCost = model.annualCost('share', savings);
    const plusCost = model.annualCost('plus', savings);
    const recommended = model.recommendation(savings);
    document.querySelector('#pricingSavingsValue').textContent = roundMoney(savings);
    document.querySelector('#shareAnnualCost').textContent = money(shareCost);
    document.querySelector('#plusAnnualCost').textContent = money(plusCost);
    document.querySelector('#shareKeepValue').textContent = money(Math.max(0, savings - shareCost));
    document.querySelector('#pricingRecommendation').innerHTML = `<strong>${model.plans[recommended].name}</strong> est probablement plus avantageux pour ce niveau d’économies.`;
    document.querySelectorAll('[data-comparison-plan]').forEach(card => card.classList.toggle('recommended', card.dataset.comparisonPlan === recommended));
    const percent = (savings - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100;
    slider.style.setProperty('--range-progress', `${percent}%`);
  }

  function renderSelection(planId) {
    document.querySelectorAll('[data-pricing-plan]').forEach(card => card.classList.toggle('selected', card.dataset.pricingPlan === planId));
    document.querySelectorAll('[data-select-plan]').forEach(button => {
      const active = button.dataset.selectPlan === planId;
      button.textContent = active ? '✓ Formule sélectionnée' : 'Choisir cette formule';
      button.setAttribute('aria-pressed', String(active));
    });
    const dashboardPlan = document.querySelector('#savingsPlanName');
    if (dashboardPlan) dashboardPlan.textContent = model.plans[planId].name;
    renderDashboard(planId);
  }

  function renderDashboard(planId = selectedPlan()) {
    const total = model.totalSavings;
    const fee = planId === 'share' ? model.annualCost('share', total) : planId === 'plus' ? model.annualCost('plus', total) : 0;
    const kept = Math.max(0, total - fee);
    const list = document.querySelector('#kotizSavingsList');
    if (list) list.innerHTML = model.savings.map(item => `<article><i>${item.icon}</i><span><strong>${item.label}</strong><small>Optimisation Kotiz acceptée</small></span><b>${roundMoney(item.amount)}</b></article>`).join('');
    document.querySelector('#generatedSavings')?.replaceChildren(document.createTextNode(roundMoney(total)));
    document.querySelector('#keptSavings')?.replaceChildren(document.createTextNode(roundMoney(kept)));
    document.querySelector('#kotizFee')?.replaceChildren(document.createTextNode(roundMoney(fee)));
    const note = document.querySelector('#savingsFeeNote');
    if (note) note.textContent = planId === 'share' ? '10 % uniquement sur les économies Kotiz acceptées · plafond annuel 120 €' : planId === 'plus' ? 'Abonnement fixe annuel · aucune commission sur les économies' : 'Aucun frais · les optimisations avancées ne sont pas incluses';
  }

  slider?.addEventListener('input', renderComparison);
  document.querySelectorAll('[data-select-plan]').forEach(button => button.addEventListener('click', () => {
    savePlan(button.dataset.selectPlan);
    renderSelection(button.dataset.selectPlan);
  }));
  renderComparison();
  renderSelection(selectedPlan());
})();
