const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

const setStep = step => {
  document.querySelectorAll('.demo-screen').forEach(screen => screen.classList.toggle('active', screen.dataset.screen === step));
  document.querySelectorAll('.step-tabs button').forEach(tab => tab.classList.toggle('active', tab.dataset.step === step));
};
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => setStep(button.dataset.step)));
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => setStep(button.dataset.next)));

const nav = document.querySelector('.nav');
const offersSection = document.querySelector('#offers');
const subscriptionsSection = document.querySelector('#subscriptions');
if (offersSection && subscriptionsSection) offersSection.parentElement.insertBefore(subscriptionsSection, offersSection);
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 30;
  nav.style.boxShadow = scrolled ? '0 8px 30px rgba(4,16,10,.14)' : 'none';
});

const routeTitles = {
  home: 'Kotiz — Money, better together.',
  finance: 'Finance — Kotiz',
  savings: 'Savings — Kotiz',
  demo: 'Démo produit — Kotiz',
  abonnement: 'Optimizations — Kotiz',
  vision: 'Vision — Kotiz'
};
const validRoutes = Object.keys(routeTitles);
const menuToggle = document.querySelector('.menu-toggle');
const syncMenuAccessibility = () => {
  const open = nav.classList.contains('menu-open');
  const mobile = window.innerWidth <= 900;
  document.querySelector('.nav-links').inert = mobile && !open;
  document.querySelector('main').inert = open;
  document.querySelector('.site-footer').inert = open;
  const isFrench = document.documentElement.lang === 'fr';
  menuToggle.setAttribute('aria-label', open ? (isFrench?'Fermer le menu':'Close menu') : (isFrench?'Ouvrir le menu':'Open menu'));
};

const renderRoute = () => {
  const requested = window.location.hash.slice(1).split('/')[0];
  const aliases = { product: 'savings', offers: 'abonnement', subscriptions: 'abonnement' };
  const normalized = aliases[requested] || requested;
  const route = validRoutes.includes(normalized) ? normalized : 'home';
  document.querySelectorAll('[data-page]').forEach(section => {
    const active = section.dataset.page === route;
    section.classList.toggle('route-active', active);
    section.toggleAttribute('hidden', !active);
    section.setAttribute('aria-hidden', String(!active));
  });
  document.querySelectorAll('.nav-links [data-route]').forEach(link => {
    const active = link.dataset.route === route;
    link.classList.toggle('active', active);
    link.setAttribute('aria-current', active ? 'page' : 'false');
  });
  document.title = routeTitles[route];
  document.body.dataset.route = route;
  nav.classList.remove('menu-open');
  document.querySelector('.nav-links').classList.remove('open');
  document.body.classList.remove('menu-is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  menuToggle.querySelectorAll('span').forEach(span => span.removeAttribute('style'));
  syncMenuAccessibility();
  window.scrollTo({ top: 0, behavior: 'auto' });
  requestAnimationFrame(() => document.querySelectorAll(`[data-page="${route}"] .reveal`).forEach(item => item.classList.add('visible')));
};

menuToggle.addEventListener('click', () => {
  const open = document.querySelector('.nav-links').classList.toggle('open');
  nav.classList.toggle('menu-open', open);
  document.body.classList.toggle('menu-is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  syncMenuAccessibility();
  if (open) document.querySelector('.nav-links a').focus({preventScroll:true});
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !nav.classList.contains('menu-open')) return;
  nav.classList.remove('menu-open');
  document.querySelector('.nav-links').classList.remove('open');
  document.body.classList.remove('menu-is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  menuToggle.focus();
  syncMenuAccessibility();
});
window.addEventListener('resize', () => {
  if (window.innerWidth <= 900 || !nav.classList.contains('menu-open')) return;
  nav.classList.remove('menu-open');
  document.querySelector('.nav-links').classList.remove('open');
  document.body.classList.remove('menu-is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
});
window.addEventListener('hashchange', renderRoute);
window.addEventListener('resize', syncMenuAccessibility);
document.addEventListener('kotiz:languagechange', syncMenuAccessibility);
renderRoute();

document.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !nav.classList.contains('menu-open')) return;
  const controls = [...nav.querySelectorAll('a,button')].filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

document.querySelectorAll('[data-hero-scroll]').forEach(button => button.addEventListener('click', () => {
  document.getElementById(button.dataset.heroScroll)?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });
}));

if (matchMedia('(pointer:fine) and (prefers-reduced-motion: no-preference)').matches) {
  document.querySelectorAll('.route-hero').forEach(hero => {
    hero.addEventListener('pointermove', event => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 12;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 10;
      hero.style.setProperty('--scene-x', `${x}px`);
      hero.style.setProperty('--scene-y', `${y}px`);
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--scene-x', '0px');
      hero.style.setProperty('--scene-y', '0px');
    });
  });
}

const quiz = document.querySelector('#savingsQuiz');
if (quiz) {
  const steps = [...quiz.querySelectorAll('.quiz-step')];
  const next = document.querySelector('#quizNext');
  const back = document.querySelector('#quizBack');
  const counter = document.querySelector('#quizCounter');
  const progress = document.querySelector('#quizProgress');
  const spend = document.querySelector('#monthlySpend');
  const spendOutput = document.querySelector('#spendOutput');
  let current = 0;
  const format = number => Math.round(number).toLocaleString('en-US');

  const showStep = index => {
    current = index;
    steps.forEach((step, i) => step.classList.toggle('active', i === current));
    counter.textContent = currentLanguage === 'fr' ? `Question ${current + 1} sur ${steps.length}` : `Question ${current + 1} of ${steps.length}`;
    progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    back.style.visibility = current ? 'visible' : 'hidden';
    next.innerHTML = current === steps.length - 1 ? (currentLanguage === 'fr' ? 'Voir mon estimation <span>→</span>' : 'See my estimate <span>→</span>') : (currentLanguage === 'fr' ? 'Continuer <span>→</span>' : 'Continue <span>→</span>');
  };

  spend.addEventListener('input', () => {
    const percent = ((spend.value - spend.min) / (spend.max - spend.min)) * 100;
    spendOutput.textContent = format(spend.value);
    spend.style.background = `linear-gradient(90deg, var(--brand-yellow) ${percent}%, #ffffff25 ${percent}%)`;
  });

  next.addEventListener('click', () => {
    const radios = steps[current].querySelectorAll('input[type="radio"]');
    if (radios.length && ![...radios].some(input => input.checked)) {
      steps[current].animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 220 });
      return;
    }
    if (current < steps.length - 1) return showStep(current + 1);
    const data = new FormData(quiz);
    const rates = { none: .05, manual: .035, app: .02 };
    const goalBoost = { save: 1.1, fair: 1, clarity: 1.05 };
    const annualSpend = Number(spend.value) * 12;
    const annualSaving = annualSpend * rates[data.get('tracking')] * goalBoost[data.get('goal')];
    document.querySelector('#annualSaving').textContent = format(annualSaving);
    document.querySelector('#monthlySaving').textContent = currentLanguage === 'fr' ? `€${format(annualSaving / 12)} chaque mois` : `€${format(annualSaving / 12)} every month`;
    document.querySelector('#withoutKotiz').textContent = `€${format(annualSpend)}`;
    document.querySelector('#withKotiz').textContent = `€${format(annualSpend - annualSaving)}`;
    quiz.style.display = 'none';
    document.querySelector('#quizResult').classList.add('active');
  });

  back.addEventListener('click', () => showStep(Math.max(0, current - 1)));
  document.querySelector('#quizRestart').addEventListener('click', () => {
    quiz.reset();
    spendOutput.textContent = '3,500';
    spend.style.background = 'linear-gradient(90deg, var(--brand-yellow) 35.7%, #ffffff25 35.7%)';
    document.querySelector('#quizResult').classList.remove('active');
    quiz.style.display = 'block';
    showStep(0);
  });
}

document.querySelectorAll('[data-offer-filter]').forEach(filter => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('[data-offer-filter]').forEach(button => button.classList.remove('active'));
    filter.classList.add('active');
    document.querySelectorAll('[data-offer-category]').forEach(card => {
      card.classList.toggle('hidden', filter.dataset.offerFilter !== 'all' && card.dataset.offerCategory !== filter.dataset.offerFilter);
    });
  });
});

document.querySelectorAll('.promo-button').forEach(button => {
  button.addEventListener('click', async () => {
    const code = button.dataset.code;
    let copied = false;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
    } catch {
      const input = document.createElement('textarea');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      input.remove();
      button.focus();
    }
    button.classList.toggle('copied', copied);
    button.querySelector('span').textContent = copied ? (currentLanguage === 'fr' ? 'Copié ✓' : 'Copied ✓') : (currentLanguage === 'fr' ? 'Copie impossible' : 'Copy unavailable');
    setTimeout(() => {
      button.classList.remove('copied');
      button.querySelector('span').textContent = currentLanguage === 'fr' ? 'Copier' : 'Copy';
    }, 1800);
  });
});

const soundlyOffer = document.querySelector('.offer-card[data-match="Spotify"]');
soundlyOffer?.addEventListener('click', event => {
  if (event.target.closest('.promo-button, .replace-suggestion')) return;
  const comparison = soundlyOffer.querySelector('.offer-comparison');
  if (!comparison) return;
  const open = soundlyOffer.classList.toggle('comparison-open');
  comparison.setAttribute('aria-hidden', String(!open));
});

document.querySelector('#simulatePurchase')?.addEventListener('click', event => {
  const demo = event.target.closest('.external-tracking');
  demo.classList.add('purchase-captured');
  event.target.textContent = currentLanguage === 'fr' ? 'Achat confirmé ✓' : 'Purchase captured ✓';
  event.target.disabled = true;
});

document.querySelector('#statementImport')?.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (file) document.querySelector('.import-button').textContent = `✓ ${file.name}`;
});

const subscriptionRows = [...document.querySelectorAll('[data-subscription]')];
const subscriptionCatalog = {
  Netflix: { plan: 'Premium', price: 21.99, billing: 'monthly', tier: 'premium', usage: 'Limited · 8 h/month · 1 screen', usageScore: 28, status: 'optimization_available', lowerPlan: 'Standard', lowerPrice: 14.99, alternativeSaving: 10, reason: 'Your usage does not appear to require 4K, spatial audio or simultaneous viewing on four screens.' },
  Spotify: { plan: 'Premium Individual', price: 12.14, billing: 'monthly', tier: 'standard', usage: 'High · 46 h/month', usageScore: 89, status: 'optimized', lowerPlan: null, lowerPrice: null, alternativeSaving: 2.55, reason: 'Your regular offline and ad-free listening makes this plan consistent with your usage.' },
  Adobe: { plan: 'Photography 1 TB', price: 23.99, billing: 'monthly_annual_commitment', tier: 'standard', usage: 'Inactive · 47 days', usageScore: 6, status: 'unused', lowerPlan: null, lowerPrice: null, alternativeSaving: 4.8, reason: 'No recent activity was detected. Check the annual commitment conditions before cancelling.' },
  'iCloud+': { plan: '2 TB', price: 9.99, billing: 'monthly', tier: 'premium', usage: 'Moderate · 146 GB used', usageScore: 68, status: 'optimization_available', lowerPlan: '200 GB', lowerPrice: 2.99, alternativeSaving: 2, reason: 'Your 146 GB usage fits within the 200 GB plan, including a reasonable storage buffer.' },
  'Basic-Fit': { plan: 'Comfort', price: 24.99, billing: 'four_weeks', signupFee: 19.99, tier: 'entry', usage: 'Regular · 11 visits/month', usageScore: 84, status: 'optimized', lowerPlan: null, lowerPrice: null, alternativeSaving: 5.42, reason: 'You already have the least expensive suitable membership and use the gym regularly.' }
};

const monthlyEquivalent = item => item.billing === 'four_weeks' ? item.price * 13 / 12 : item.price;
const billingLabel = item => item.billing === 'four_weeks' ? `/ 4 weeks · €${item.signupFee.toFixed(2)} signup fee` : item.billing === 'monthly_annual_commitment' ? '/ month · annual commitment' : '/ month';

subscriptionRows.forEach(row => {
  const service = row.querySelector('.service-name strong').textContent.trim();
  const item = subscriptionCatalog[service];
  if (!item) return;
  const saving = item.lowerPrice == null ? 0 : Math.max(0, item.price - item.lowerPrice);
  row.dataset.service = service;
  row.dataset.price = String(item.price);
  row.dataset.monthlyEquivalent = String(monthlyEquivalent(item));
  row.dataset.recommendationStatus = item.status;
  row.dataset.recommendationSaving = String(saving);
  row.dataset.attention = String(item.status === 'optimization_available' || item.status === 'unused');
  row.dataset.unused = String(item.status === 'unused');
  row.classList.toggle('attention', row.dataset.attention === 'true');
  row.classList.toggle('unused', item.status === 'unused');
  row.querySelector('.service-name small').textContent = `${item.plan} · ${item.usage}`;
  row.querySelector('.sub-price strong').textContent = `€${item.price.toFixed(2)}`;
  row.querySelector('.sub-price small').textContent = billingLabel(item);
  const status = row.querySelector('.price-alert, .sub-status');
  status.className = item.status === 'optimized' ? 'sub-status optimized-status' : 'price-alert';
  status.textContent = item.status === 'optimization_available' ? 'Optimization possible' : item.status === 'unused' ? 'Unused subscription' : 'Already optimized';
  const menu = row.querySelector('.manage-menu');
  const manageButton = row.querySelector('.manage-sub');
  manageButton.innerHTML = '<span>Manage</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>';
  manageButton.setAttribute('aria-label', `Manage ${service}`);
  manageButton.setAttribute('title', `Manage ${service}`);
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `<div class="manage-menu-head"><small>CURRENT PLAN</small><strong>${item.plan}</strong></div><button class="analysis-sub" type="button">View usage analysis</button>${item.lowerPlan ? `<button class="downgrade-sub" type="button">Switch to ${item.lowerPlan}<small>Save €${saving.toFixed(2)}/month</small></button>` : ''}${item.alternativeSaving == null ? '' : `<button class="alternative-sub" type="button" data-alternative-saving="${item.alternativeSaving.toFixed(2)}">Compare alternatives</button>`}<div class="manage-menu-separator"></div><button class="pause-sub" type="button">Pause subscription</button><button class="cancel-sub" type="button">Cancel subscription</button>`;
  const panel = document.createElement('div');
  panel.className = 'plan-recommendation';
  panel.hidden = true;
  panel.innerHTML = `<div class="usage-visual"><div class="usage-score" style="--usage:${item.usageScore}"><strong>${item.usageScore}%</strong></div><small>PLAN UTILIZATION</small><b>${item.usage}</b></div>${item.status === 'optimization_available' ? `<div class="recommendation-copy"><span>OPTIMIZATION AVAILABLE</span><strong>${item.plan} → ${item.lowerPlan}</strong><p>${item.reason}</p></div><div class="recommendation-saving"><small>POTENTIAL SAVING</small><strong>€${saving.toFixed(2)}<span>/month</span></strong><b>€${(saving * 12).toFixed(2)}/year</b></div><button class="confirm-downgrade" type="button">Choose ${item.lowerPlan}</button>` : `<div class="recommendation-copy"><span>${item.status === 'unused' ? 'USAGE ALERT' : 'ALREADY OPTIMIZED'}</span><strong>${item.plan}</strong><p>${item.reason}</p></div><div class="recommendation-saving"><small>POTENTIAL DOWNGRADE SAVING</small><strong>€0.00<span>/month</span></strong><b>${item.status === 'unused' ? 'Cancellation may save more' : 'No change recommended'}</b></div>`}`;
  row.appendChild(panel);
});

const energyCards = [...document.querySelectorAll('[data-energy-card]')];
const cancelModal = document.querySelector('#cancelModal');
let selectedSubscription = null;

const calculateEnergyCard = card => {
  const usage = Math.max(0, Number(card.querySelector('.energy-usage').value) || 0);
  const paid = Math.max(0, Number(card.querySelector('.energy-bill').value) || 0);
  const expected = usage * Number(card.dataset.unitRate) + Number(card.dataset.fixedCost);
  const difference = paid - expected;
  const positiveDifference = Math.max(0, difference);
  const frenchLanguage = document.documentElement.lang === 'fr';
  card.querySelector('.expected-cost').textContent = `€${expected.toFixed(2)}`;
  card.querySelector('.energy-difference').textContent = `${difference >= 0 ? '+' : '−'}€${Math.abs(difference).toFixed(2)}`;
  card.querySelector('.current-yearly').textContent = `€${(paid * 12).toFixed(2)}`;
  const alternativeYearly = expected * 12 * 0.94;
  card.querySelector('.alternative-yearly').textContent = `€${alternativeYearly.toFixed(2)}`;
  card.querySelector('.energy-year-saving').textContent = `€${Math.max(0, paid * 12 - alternativeYearly).toFixed(2)}/${frenchLanguage ? 'an' : 'year'}`;
  const meter = card.querySelector('.energy-meter i');
  meter.style.width = `${paid ? Math.min(100, expected / paid * 100) : 0}%`;
  card.classList.toggle('energy-ok', difference <= 2);
  card.querySelector('.energy-flag').textContent = difference <= 2 ? (frenchLanguage ? 'COHÉRENT' : 'IN LINE') : (frenchLanguage ? 'PRIX À VÉRIFIER' : 'CHECK PRICE');
  return positiveDifference;
};

const updateSubscriptionSummary = () => {
  const active = subscriptionRows.filter(row => row.dataset.state === 'active');
  const total = active.reduce((sum, row) => sum + Number(row.dataset.monthlyEquivalent || row.dataset.price), 0);
  const subscriptionPotential = active.reduce((sum, row) => {
    if (row.dataset.recommendationStatus === 'unused') return sum + Number(row.dataset.monthlyEquivalent || row.dataset.price);
    if (row.dataset.recommendationStatus === 'optimization_available') return sum + Number(row.dataset.recommendationSaving || 0);
    return sum;
  }, 0);
  const energyPotential = energyCards.reduce((sum, card) => sum + calculateEnergyCard(card), 0);
  document.querySelector('#subscriptionTotal').textContent = `€${total.toFixed(2)}`;
  document.querySelector('#activeCount').textContent = document.documentElement.lang === 'fr' ? `${active.length} abonnement${active.length === 1 ? '' : 's'} actif${active.length === 1 ? '' : 's'}` : `${active.length} active subscription${active.length === 1 ? '' : 's'}`;
  document.querySelector('#subscriptionSavings').textContent = `€${(subscriptionPotential + energyPotential).toFixed(2)}`;
  const attentionCount = subscriptionRows.filter(row => row.dataset.state !== 'cancelled' && row.dataset.attention === 'true').length;
  const unusedCount = subscriptionRows.filter(row => row.dataset.state !== 'cancelled' && row.dataset.unused === 'true').length;
  const attentionBadge = document.querySelector('[data-sub-filter="attention"] span');
  const unusedBadge = document.querySelector('[data-sub-filter="unused"] span');
  if (attentionBadge) attentionBadge.textContent = String(attentionCount);
  if (unusedBadge) unusedBadge.textContent = String(unusedCount);
};

document.querySelectorAll('.manage-sub').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    const menu = button.nextElementSibling;
    document.querySelectorAll('.manage-menu').forEach(other => {
      if (other !== menu) other.classList.remove('open');
    });
    menu.classList.toggle('open');
  });
});

const showPlanRecommendation = row => {
  document.querySelectorAll('.plan-recommendation').forEach(panel => { if (panel !== row.querySelector('.plan-recommendation')) panel.hidden = true; });
  const panel = row.querySelector('.plan-recommendation');
  panel.hidden = false;
  row.querySelector('.manage-menu').classList.remove('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

document.querySelectorAll('.analysis-sub, .downgrade-sub').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    showPlanRecommendation(button.closest('[data-subscription]'));
  });
});

document.querySelectorAll('.confirm-downgrade').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    const row = button.closest('[data-subscription]');
    const item = subscriptionCatalog[row.dataset.service];
    if (!item?.lowerPlan || item.lowerPrice == null) return;
    item.plan = item.lowerPlan;
    item.price = item.lowerPrice;
    item.tier = 'standard';
    item.status = 'optimized';
    row.dataset.price = String(item.price);
    row.dataset.monthlyEquivalent = String(monthlyEquivalent(item));
    row.dataset.recommendationStatus = 'optimized';
    row.dataset.recommendationSaving = '0';
    row.dataset.attention = 'false';
    row.classList.remove('attention');
    row.querySelector('.service-name small').textContent = `${item.plan} · ${item.usage}`;
    row.querySelector('.sub-price strong').textContent = `€${item.price.toFixed(2)}`;
    const status = row.querySelector('.price-alert, .sub-status');
    status.className = 'sub-status optimized-status';
    status.textContent = document.documentElement.lang === 'fr' ? 'Formule optimisée' : 'Plan optimized';
    row.querySelector('.manage-menu-head strong').textContent = item.plan;
    row.querySelector('.downgrade-sub')?.remove();
    const panel = row.querySelector('.plan-recommendation');
    panel.innerHTML = `<div class="recommendation-copy"><span>${document.documentElement.lang === 'fr' ? 'FORMULE MODIFIÉE' : 'PLAN UPDATED'}</span><strong>${item.plan}</strong><p>${document.documentElement.lang === 'fr' ? 'La formule recommandée a été sélectionnée dans cette démonstration. Vérifiez toujours les conditions du fournisseur avant un changement réel.' : 'The recommended plan was selected in this demo. Always review the provider terms before making a real change.'}</p></div><div class="recommendation-saving success-saving"><strong>✓</strong><b>${document.documentElement.lang === 'fr' ? 'Économie intégrée au budget' : 'Saving applied to budget'}</b></div>`;
    updateSubscriptionSummary();
  });
});

document.addEventListener('click', () => document.querySelectorAll('.manage-menu').forEach(menu => menu.classList.remove('open')));

document.querySelectorAll('.pause-sub').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    const row = button.closest('[data-subscription]');
    const paused = row.dataset.state === 'paused';
    row.dataset.state = paused ? 'active' : 'paused';
    row.classList.toggle('cancelled', !paused);
    button.textContent = paused ? (document.documentElement.lang === 'fr' ? 'Mettre en pause' : 'Pause subscription') : (document.documentElement.lang === 'fr' ? 'Reprendre l’abonnement' : 'Resume subscription');
    row.querySelector('.manage-sub span').textContent = paused ? (document.documentElement.lang === 'fr' ? 'Gérer' : 'Manage') : (document.documentElement.lang === 'fr' ? 'En pause' : 'Paused');
    row.querySelector('.manage-menu').classList.remove('open');
    updateSubscriptionSummary();
  });
});

document.querySelectorAll('.cancel-sub').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    selectedSubscription = button.closest('[data-subscription]');
    const name = selectedSubscription.querySelector('.service-name strong').textContent;
    const annual = Number(selectedSubscription.dataset.monthlyEquivalent || selectedSubscription.dataset.price) * 12;
    document.querySelector('#cancelService').textContent = name;
    document.querySelector('#cancelSaving').textContent = `€${annual.toFixed(0)}`;
    cancelModal.classList.add('open');
    document.querySelector('.modal-close').focus();
    selectedSubscription.querySelector('.manage-menu').classList.remove('open');
  });
});

const closeCancelModal = () => {
  if (!cancelModal) return;
  cancelModal.classList.remove('open');
  const trigger = selectedSubscription?.querySelector('.manage-sub');
  if (trigger && !trigger.disabled) trigger.focus();
};
document.querySelector('.modal-close')?.addEventListener('click', closeCancelModal);
document.querySelector('.keep-sub')?.addEventListener('click', closeCancelModal);
cancelModal?.addEventListener('click', event => { if (event.target === cancelModal) closeCancelModal(); });
document.querySelector('.confirm-cancel')?.addEventListener('click', () => {
  if (!selectedSubscription) return;
  selectedSubscription.dataset.state = 'cancelled';
  selectedSubscription.classList.add('cancelled');
  selectedSubscription.querySelector('.manage-sub span').textContent = document.documentElement.lang === 'fr' ? 'Résilié' : 'Cancelled';
  selectedSubscription.querySelector('.manage-sub').disabled = true;
  updateSubscriptionSummary();
  closeCancelModal();
});

document.querySelectorAll('[data-sub-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-sub-filter]').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    subscriptionRows.forEach(row => {
      const filter = button.dataset.subFilter;
      const visible = filter === 'all' || (filter === 'attention' && row.dataset.attention === 'true') || (filter === 'unused' && row.dataset.unused === 'true');
      row.style.display = visible ? 'grid' : 'none';
    });
  });
});

energyCards.forEach(card => {
  card.querySelectorAll('.energy-usage, .energy-bill').forEach(input => input.addEventListener('input', updateSubscriptionSummary));
  card.querySelector('.compare-energy').addEventListener('click', () => {
    const alternatives = card.querySelector('.energy-alternatives');
    alternatives.hidden = !alternatives.hidden;
    card.classList.toggle('comparison-visible', !alternatives.hidden);
  });
});

document.querySelector('#runUsageScan')?.addEventListener('click', event => {
  const button = event.currentTarget;
  const status = document.querySelector('#scanStatus');
  button.disabled = true;
  button.classList.add('scanning');
  status.textContent = document.documentElement.lang === 'fr' ? 'Analyse en cours…' : 'Scanning activity…';
  window.setTimeout(() => {
    button.disabled = false;
    button.classList.remove('scanning');
    status.textContent = document.documentElement.lang === 'fr' ? 'Analyse terminée · 1 service inutilisé' : 'Scan complete · 1 unused service';
    document.querySelector('#unusedAlert')?.classList.add('audit-complete');
  }, 850);
});

document.querySelector('[data-show-unused]')?.addEventListener('click', () => {
  document.querySelector('[data-sub-filter="unused"]')?.click();
  document.querySelector('.subscription-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.querySelectorAll('[data-sub-jump]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-sub-jump]').forEach(item => item.classList.toggle('active', item === button));
    document.getElementById(button.dataset.subJump)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

updateSubscriptionSummary();

const french = {
  'TOTAL HOUSEHOLD MONEY':'TOTAL ARGENT DU FOYER','Accounts, savings and investments combined':'Comptes, épargne et placements réunis','Bank accounts':'Comptes bancaires','Savings & investments':'Épargne et placements','MONTHLY SPENDING MIX':'RÉPARTITION DES DÉPENSES MENSUELLES','Where your money goes':'Où part votre argent','Housing':'Logement','Food':'Alimentation','Other':'Autres',
  'AUTOMATIC TRACKING':'SUIVI AUTOMATIQUE','Shop anywhere.':'Achetez où vous voulez.','See it instantly in Kotiz.':'Retrouvez-le instantanément dans Kotiz.','When your household pays on an external website, Kotiz recognizes the transaction and records it in your shared budget automatically.':'Quand votre foyer paie sur un site externe, Kotiz reconnaît la transaction et l’enregistre automatiquement dans votre budget partagé.','Complete purchase':'Finaliser l’achat','automatic capture':'capture automatique','NEW TRANSACTION':'NOUVELLE TRANSACTION','Household · Home':'Foyer · Maison','Added automatically to your budget':'Ajouté automatiquement à votre budget',
  'Too many tools can make money easy to forget.':'Trop d’outils font parfois oublier son argent.','A Livret, an old subscription or a small investment can disappear from your daily view. Kotiz brings them back into one clear family picture.':'Un livret, un ancien abonnement ou un petit placement peut disparaître de votre quotidien. Kotiz les rassemble dans une vue familiale claire.','FAMILY MEMBERS':'MEMBRES DE LA FAMILLE','See everyone\'s savings':'Voir l’épargne de chacun','＋ Add member':'＋ Ajouter un membre','Household owner':'Titulaire du foyer','Household member':'Membre du foyer','Livret Jeune · View only':'Livret Jeune · Consultation seule','Add a family member to see their savings in the shared view.':'Ajoutez un membre pour voir son épargne dans la vue partagée.','Choose a member to see their savings in the shared view.':'Choisissez un membre pour voir son épargne dans la vue partagée.','View':'Voir','SELECTED RESERVE':'ÉPARGNE SÉLECTIONNÉE','View only · Latest synced balance':'Consultation seule · Dernier solde synchronisé','View-only':'Consultation seule',
  'Home':'Accueil','Product':'Produit','Finance':'Finance','Savings':'Économies','Offers':'Offres','Subscriptions':'Abonnements','Vision':'Vision','Explore':'Découvrir',
  'Money clarity for the whole household.':'La clarté financière pour tout le foyer.','View-only by design':'Consultation seule par conception.','Built with care in Paris, France':'Conçu avec soin à Paris, France',
  'Finance, made for households':'La finance pensée pour les foyers','Money, better':'L’argent, mieux','together.':'ensemble.',
  'A smarter way for households to manage, split and understand their money — fairly and transparently.':'Une façon plus intelligente de gérer, répartir et comprendre l’argent du foyer — avec équité et transparence.',
  'Discover the concept':'Découvrir le concept','Discover offers':'Découvrir les offres','Built for real life':'Pensé pour la vraie vie','Not just repayments':'Bien plus que des remboursements',
  'HOUSEHOLD BALANCE':'SOLDE DU FOYER','this month':'ce mois-ci','Good morning,':'Bonjour,','Available this month':'Disponible ce mois-ci','spent':'dépensés',
  'Add':'Ajouter','Split':'Répartir','Goals':'Objectifs','Recent activity':'Activité récente','See all':'Tout voir','Today · Home':'Aujourd’hui · Maison','Yesterday · Shared':'Hier · Partagé','Bills':'Factures','SPLIT COMPLETE':'RÉPARTITION TERMINÉE','Fairly divided':'Réparti équitablement',
  'THE PROBLEM':'LE PROBLÈME','THE FAMILY BUDGET CHALLENGE':'LE DÉFI DU BUDGET FAMILIAL','Managing a family budget is simple.':'Gérer un budget familial est simple.','Saving consistently isn\'t.':'Épargner régulièrement ne l’est pas.','Daily spending.':'Dépenses du quotidien.','Recurring bills.':'Factures récurrentes.','Savings that disappear.':'Économies qui disparaissent.','Where does it go?':'Où part notre argent ?','Small purchases and recurring costs make the family budget hard to read.':'Les petits achats et les coûts récurrents rendent le budget familial difficile à comprendre.','Are we on track?':'Sommes-nous dans les temps ?','Without a shared view, good intentions turn into postponed savings goals.':'Sans vision commune, les bonnes intentions deviennent des objectifs d’épargne reportés.','Could we save more?':'Pourrions-nous économiser davantage ?','Families miss cheaper alternatives and practical ways to reduce their costs.':'Les familles passent à côté d’alternatives moins chères et de moyens concrets de réduire leurs dépenses.',
  'THE SOLUTION':'LA SOLUTION','Meet your household\'s':'Voici le copilote financier','financial co-pilot.':'de votre foyer.','One calm place to budget, split, save and understand money together.':'Un espace unique pour budgéter, répartir, épargner et comprendre ses finances ensemble.','Household overview':'Vue du foyer','Total budget':'Budget total','Total spent':'Total dépensé','Available':'Disponible','Shared budget':'Budget partagé','Automatic splits':'Répartition automatique','Income-based fairness':'Équité selon les revenus','Actionable insights':'Conseils utiles',
  'YOUR FINANCIAL SPACE':'VOTRE ESPACE FINANCIER','All your money.':'Tout votre argent.','One clear view.':'Une seule vue claire.','See your savings, investments, rent and linked accounts in one place. Kotiz only displays your information and never moves your money.':'Consultez votre épargne, vos placements, votre loyer et vos comptes reliés au même endroit. Kotiz affiche vos informations sans jamais déplacer votre argent.','View-only mode':'Mode consultation','Your banks remain in control':'Vos banques gardent le contrôle','TOTAL SAVINGS & INVESTMENTS':'TOTAL ÉPARGNE ET PLACEMENTS','+4.8% since January':'+4,8 % depuis janvier','MONTHLY RENT':'LOYER MENSUEL','Next payment':'Prochain paiement','Next payment · Sep 05':'Prochain paiement · 5 septembre','CONNECTED ACCOUNTS':'COMPTES RELIÉS','Last sync':'Dernière synchronisation','Last sync · Today, 09:41':'Dernière synchronisation · Aujourd’hui, 09:41','SAVINGS & INVESTMENTS':'ÉPARGNE ET PLACEMENTS','Your reserves':'Vos réserves','Add manually':'Ajouter manuellement','＋ Add manually':'＋ Ajouter manuellement','Emergency fund':'Épargne de précaution','Short-term projects':'Projets à court terme','Long-term placement':'Placement long terme','Balances are displayed from your latest bank sync.':'Les soldes proviennent de votre dernière synchronisation bancaire.','HOUSING':'LOGEMENT','Your rent':'Votre loyer','RECURRING':'RÉCURRENT','per month':'par mois','YEARLY TOTAL':'TOTAL ANNUEL','September 05':'5 septembre','68% of this month\'s housing budget':'68 % du budget logement de ce mois','of this month\'s housing budget':'du budget logement de ce mois','DATA IMPORTS':'IMPORTS DE DONNÉES','Bring your statements together':'Regroupez vos relevés','Import a statement to complete your household view. Your file stays on this device.':'Importez un relevé pour compléter la vue de votre foyer. Votre fichier reste sur cet appareil.','Import a statement':'Importer un relevé','＋ Import a statement':'＋ Importer un relevé','CSV, PDF or OFX · Read-only analysis':'CSV, PDF ou OFX · Analyse en consultation','CONNECTED BANKS':'BANQUES RELIÉES','Your accounts':'Vos comptes','Synced today':'Synchronisé aujourd’hui','Synced today · 2 accounts':'Synchronisé aujourd’hui · 2 comptes','Synced today · 1 account':'Synchronisé aujourd’hui · 1 compte','Open bank app':'Ouvrir l’application bancaire','Open bank app ↗':'Ouvrir l’application bancaire ↗','Kotiz displays balances only. To manage your money, use your bank\'s app.':'Kotiz affiche uniquement vos soldes. Pour gérer votre argent, utilisez l’application de votre banque.',
  'HOW IT WORKS':'COMMENT ÇA MARCHE','Fairness, calculated':'L’équité, calculée','in seconds.':'en quelques secondes.','Add an expense':'Ajouter une dépense','Enter what was paid':'Saisissez le montant payé','Choose the split':'Choisir la répartition','Equal, custom or by income':'Égale, personnalisée ou selon les revenus','Balance updates':'Le solde se met à jour','Everyone knows where they stand':'Chacun sait où il en est','New expense':'Nouvelle dépense','AMOUNT':'MONTANT','DESCRIPTION':'DESCRIPTION','Monthly rent':'Loyer mensuel','Continue':'Continuer','Split method':'Mode de répartition','SELECT A METHOD':'CHOISISSEZ UNE MÉTHODE','Split equally':'Répartir à parts égales','each':'chacun','Proportional to income':'Proportionnelle aux revenus','Based on each person\'s income':'Selon les revenus de chacun','Custom split':'Répartition personnalisée','Choose exact amounts':'Choisir les montants exacts','Calculate split':'Calculer la répartition','Split complete':'Répartition terminée','Fairly split.':'Répartition équitable.','Based on your household incomes':'Selon les revenus de votre foyer','pays':'paie','of the expense':'de la dépense','Done':'Terminé',
  'YOUR KOTIZ POTENTIAL':'VOTRE POTENTIEL KOTIZ','What could better money':'Que pourraient vous apporter','habits unlock for you?':'de meilleures habitudes ?','Answer four quick questions. Kotiz will estimate what your household could save in one year.':'Répondez à quatre questions. Kotiz estimera les économies annuelles possibles pour votre foyer.','Who do you manage money with?':'Avec qui gérez-vous votre argent ?','This helps us understand your household.':'Cela nous aide à comprendre votre foyer.','My partner':'Mon partenaire','Couple or young family':'Couple ou jeune famille','Flatmates':'Colocataires','A shared home':'Un logement partagé','My family':'Ma famille','Including teenagers':'Avec des adolescents','How much does your household spend each month?':'Combien votre foyer dépense-t-il chaque mois ?','An approximate amount is perfect.':'Une estimation suffit.','How do you track shared expenses today?':'Comment suivez-vous vos dépenses communes ?','Be honest — there is no wrong answer.':'Soyez honnête — il n’y a pas de mauvaise réponse.','We don\'t, really':'Pas vraiment','Mostly from memory':'Surtout de mémoire','Notes or spreadsheet':'Notes ou tableur','Some manual tracking':'Un suivi manuel','A dedicated app':'Une application dédiée','We already track closely':'Nous suivons déjà précisément','What matters most to your household?':'Qu’est-ce qui compte le plus pour votre foyer ?','Kotiz adapts the experience to your priority.':'Kotiz adapte l’expérience à votre priorité.','Save more':'Épargner davantage','Reach our goals sooner':'Atteindre nos objectifs plus vite','Split fairly':'Répartir équitablement','Match our real incomes':'Respecter nos revenus réels','Get clarity':'Gagner en clarté','Understand our spending':'Comprendre nos dépenses','Back':'Retour','YOUR ESTIMATED KOTIZ IMPACT':'VOTRE IMPACT KOTIZ ESTIMÉ','You could save up to':'Vous pourriez économiser jusqu’à','to put toward what matters to you.':'à consacrer à ce qui compte pour vous.','Without Kotiz':'Sans Kotiz','Potential with Kotiz':'Potentiel avec Kotiz','annual household spending':'dépenses annuelles du foyer','after estimated savings':'après économies estimées','Retake the quiz':'Recommencer le questionnaire',
  'KOTIZ OFFERS':'OFFRES KOTIZ','Spend less on what':'Dépensez moins pour ce','you already use.':'que vous utilisez déjà.','Kotiz spots recurring expenses and suggests relevant, lower-cost alternatives — always optional, always transparent.':'Kotiz détecte les dépenses récurrentes et suggère des alternatives pertinentes et moins chères — toujours facultatives et transparentes.','ALTERNATIVES FOR YOUR SUBSCRIPTION':'ALTERNATIVES POUR VOTRE ABONNEMENT','In place of Spotify':'À la place de Spotify','Compare prices':'Comparer les prix','Spotify':'Spotify','Do you often eat out?':'Vous avez l’habitude d’aller au restaurant ?','Find partner restaurants near you and enjoy benefits designed for your household budget.':'Trouvez des restaurants partenaires à proximité de chez vous et profitez d’avantages pensés pour votre budget.','Find restaurants near me':'Trouver des restaurants près de chez moi','All offers':'Toutes les offres','Subscriptions':'Abonnements','Everyday':'Quotidien','Services':'Services','Save':'Économisez','Use code':'Utiliser le code','Copy':'Copier','Instant savings':'Économies immédiates','Qualified customers':'Clients qualifiés','Affiliate revenue':'Revenus d’affiliation',
  'SUBSCRIPTION CONTROL':'GESTION DES ABONNEMENTS','Every recurring payment.':'Chaque paiement récurrent.','Finally under control.':'Enfin sous contrôle.','Kotiz brings subscriptions and frequent expenses into one calm interface — track, optimize or cancel in a few taps.':'Kotiz réunit abonnements et dépenses fréquentes dans une interface simple — suivez, optimisez ou résiliez en quelques clics.','Upcoming payments':'Prochains paiements','Savings opportunities':'Opportunités d’économie','SUBSCRIPTION HEALTH':'SANTÉ DES ABONNEMENTS','opportunities found':'opportunités détectées','RECURRING EXPENSES':'DÉPENSES RÉCURRENTES','Your subscriptions':'Vos abonnements','Add manually':'Ajouter manuellement','Monthly total':'Total mensuel','active subscriptions':'abonnements actifs','Potential savings':'Économies potentielles','per month detected':'détectées par mois','Next payment':'Prochain paiement','Needs attention':'À vérifier','Sort by date':'Trier par date','NEXT PAYMENT':'PROCHAIN PAIEMENT','Price increased':'Prix en hausse','Unused for 47 days':'Inutilisé depuis 47 jours','Active':'Actif','Manage':'Gérer','Pause subscription':'Mettre en pause','Cancel subscription':'Résilier','SMART CHECK':'VÉRIFICATION INTELLIGENTE','Keep it for now':'Conserver pour l’instant','Confirm cancellation':'Confirmer la résiliation',
  'BUILT FOR REAL LIFE':'PENSÉ POUR LA VRAIE VIE','Every household has':'Chaque foyer a','its own rhythm.':'son propre rythme.','Couples &':'Couples et','young families':'jeunes familles','Families with teenagers':'Familles avec adolescents','OUR DIFFERENCE':'NOTRE DIFFÉRENCE','Most tools ask':'La plupart des outils demandent','We ask':'Nous demandons','Budget':'Budget','Automation':'Automatisation','Insights':'Analyses',
  'BUSINESS & VISION':'MODÈLE ET VISION','Simple to start.':'Simple pour commencer.','Built to grow.':'Pensé pour grandir.','FREEMIUM MODEL':'MODÈLE FREEMIUM','Essential money clarity,':'La clarté financière essentielle,','free for every household.':'gratuite pour chaque foyer.','Premium, when you\'re ready':'Premium, quand vous êtes prêt','3-YEAR VISION':'VISION À 3 ANS','Validate':'Valider','Grow':'Grandir','Scale':'Changer d’échelle','OUR BELIEF':'NOTRE CONVICTION','Money is personal.':'L’argent est personnel.','Managing it together':'Le gérer ensemble','shouldn\'t be complicated.':'ne devrait pas être compliqué.','Back home':'Retour à l’accueil','Built with care in Paris, France':'Conçu avec soin à Paris, France'
};

Object.assign(french, {
  'THE FAMILY BUDGET CHALLENGE':'LE DÉFI DU BUDGET FAMILIAL',
  'Managing a family budget is simple.':'Gérer un budget familial semble simple.',
  'Saving consistently isn\'t.':'Épargner régulièrement ne l’est pas.',
  'ONE MONTH, AT A GLANCE':'UN MOIS, EN UN COUP D’ŒIL',
  'DEMO HOUSEHOLD':'FOYER DE DÉMONSTRATION',
  'Total outflow':'Total des dépenses',
  'of €4,800 household income':'sur 4 800 € de revenus du foyer',
  'Housing':'Logement',
  'Food & everyday':'Alimentation et quotidien',
  'Bills & subscriptions':'Factures et abonnements',
  'Uncategorized':'Non catégorisé',
  '€432 has no clear category':'432 € sans catégorie claire',
  'Small purchases add up without anyone noticing.':'Les petits achats s’accumulent sans que personne ne s’en aperçoive.',
  'VISIBILITY':'VISIBILITÉ',
  'Daily purchases, bills and subscriptions live in different places. The household never sees the full picture.':'Les achats, factures et abonnements sont dispersés. Le foyer ne voit jamais l’ensemble de la situation.',
  'transactions':'transactions',
  'to review':'à vérifier',
  'PROGRESS':'PROGRESSION',
  'Without one shared view, monthly goals become guesswork — and saving is postponed again.':'Sans vision commune, les objectifs mensuels deviennent approximatifs — et l’épargne est encore reportée.',
  'Goal':'Objectif',
  'OPPORTUNITY':'OPPORTUNITÉ',
  'Price increases and cheaper alternatives are easy to miss when recurring expenses run silently.':'Les hausses de prix et les alternatives moins chères passent inaperçues lorsque les paiements récurrents sont silencieux.',
  'POTENTIAL':'POTENTIEL',
  'The problem isn\'t a lack of effort.':'Le problème n’est pas le manque d’effort.',
  'It\'s a lack of one clear, shared system.':'C’est l’absence d’un système commun et lisible.',
  'shared view':'vue partagée',
  'mental math':'calcul mental',
  'better decisions':'meilleures décisions'
});

Object.assign(french, {
  'WHAT KOTIZ CONNECTS':'CE QUE KOTIZ RÉUNIT',
  'Four essentials.':'Quatre essentiels.',
  'One household view.':'Une seule vue du foyer.',
  'Every transaction becomes useful: Kotiz turns scattered payments into a budget your whole household can understand and act on.':'Chaque transaction devient utile : Kotiz transforme des paiements dispersés en un budget que tout le foyer peut comprendre et piloter.',
  'Income, expenses and goals stay in one live view, accessible to everyone in the household.':'Revenus, dépenses et objectifs restent réunis dans une vue actualisée, accessible à tout le foyer.',
  'Shared payments are divided instantly, with no reminders, spreadsheets or mental math.':'Les paiements communs sont répartis instantanément, sans relances, tableurs ni calcul mental.',
  'Fair by design':'Équitable par nature',
  'Choose equal, custom or income-based rules so each person contributes in the right way.':'Choisissez une règle égale, personnalisée ou selon les revenus pour que chacun contribue justement.',
  'Spot recurring costs, budget drift and saving opportunities before the end of the month.':'Repérez les coûts récurrents, les écarts de budget et les économies possibles avant la fin du mois.',
  'UP NEXT':'À SUIVRE',
  'See fairness calculated in seconds.':'Découvrez une répartition équitable en quelques secondes.',
  'How it works':'Comment ça marche'
});

Object.assign(french, {
  'Total saving potential':'Potentiel d’économie total',
  'subscriptions and energy':'abonnements et énergie',
  'KOTIZ SMART AUDIT':'AUDIT INTELLIGENT KOTIZ',
  'Pay only for what you use.':'Payez uniquement ce que vous utilisez.',
  'Linked accounts help Kotiz identify inactive services and compare utility bills with actual consumption.':'Les comptes liés permettent à Kotiz d’identifier les services inactifs et de comparer les factures à la consommation réelle.',
  'Scan linked accounts':'Analyser les comptes liés',
  'Bank payments connected':'Paiements bancaires connectés',
  'Email receipts connected':'Factures e-mail connectées',
  'Service activity connected':'Activité des services connectée',
  'Last scan · today':'Dernière analyse · aujourd’hui',
  'UNUSED SUBSCRIPTIONS':'ABONNEMENTS INUTILISÉS',
  '€32.99/month may be wasted':'32,99 €/mois potentiellement gaspillés',
  'Adobe has not been used for 47 days and Basic-Fit for 61 days.':'Adobe n’a pas été utilisé depuis 47 jours et Basic-Fit depuis 61 jours.',
  'Review 2 services →':'Examiner les 2 services →',
  'ENERGY BILL CHECK':'VÉRIFICATION DES FACTURES D’ÉNERGIE',
  'Compare bills with your usage':'Comparez vos factures à votre consommation',
  'Adjust your monthly consumption and amount paid. Kotiz estimates an expected cost and flags a possible difference.':'Modifiez votre consommation mensuelle et le montant payé. Kotiz estime le coût attendu et signale un éventuel écart.',
  'ELECTRICITY':'ÉLECTRICITÉ',
  'NATURAL GAS':'GAZ NATUREL',
  'Monthly bill':'Facture mensuelle',
  'CHECK PRICE':'PRIX À VÉRIFIER',
  'Usage':'Consommation',
  'Amount paid':'Montant payé',
  'Estimated cost for this usage':'Coût estimé pour cette consommation',
  'Possible difference':'Écart possible',
  'Usage-based estimate':'Estimation selon la consommation',
  'Compare electricity offers':'Comparer les offres d’électricité',
  'Compare gas offers':'Comparer les offres de gaz',
  'ILLUSTRATIVE COMPARISON':'COMPARAISON INDICATIVE',
  'Current estimated yearly cost':'Coût annuel actuel estimé',
  'Example alternative':'Exemple d’alternative',
  'Potential saving:':'Économie potentielle :',
  'Estimates include an illustrative unit rate and fixed monthly charge. Taxes, tariff options and regulated adjustments can change the final bill. Kotiz flags a difference; it does not certify supplier overbilling.':'Les estimations utilisent un prix unitaire et un abonnement mensuel indicatifs. Les taxes, options tarifaires et ajustements réglementaires peuvent modifier la facture finale. Kotiz signale un écart sans certifier une surfacturation du fournisseur.',
  'Unused':'Inutilisés',
  'Unused services':'Services inutilisés',
  'Energy bills':'Factures d’énergie',
  'HOUSEHOLD COST HEALTH':'SANTÉ DES DÉPENSES DU FOYER',
  '5 opportunities found':'5 opportunités détectées',
  'Software · Last used 47 days ago':'Logiciel · Dernière utilisation il y a 47 jours',
  'Fitness · Last used 61 days ago':'Sport · Dernière utilisation il y a 61 jours',
  'Unused for 61 days':'Inutilisé depuis 61 jours'
});

Object.assign(french, {
  'Estimated monthly equivalent':'Équivalent mensuel estimé',
  'UNUSED SUBSCRIPTION':'ABONNEMENT INUTILISÉ',
  '€23.99/month may be wasted':'23,99 €/mois potentiellement gaspillés',
  'Adobe Photography has not been used for 47 days. Basic-Fit is used regularly and remains marked as optimized.':'Adobe Photographie n’a pas été utilisé depuis 47 jours. Basic-Fit est utilisé régulièrement et reste considéré comme optimisé.',
  'Review this service →':'Examiner ce service →',
  'CURRENT PLAN':'FORMULE ACTUELLE',
  'View usage analysis':'Voir l’analyse d’utilisation',
  'Switch to Standard':'Passer à Standard',
  'Switch to 200 GB':'Passer à 200 Go',
  'Save €7.00/month':'Économiser 7,00 €/mois',
  'Compare alternatives':'Comparer les alternatives',
  'Resume subscription':'Reprendre l’abonnement',
  'Paused':'En pause',
  'Cancelled':'Résilié',
  'Optimization possible':'Optimisation possible',
  'Unused subscription':'Abonnement inutilisé',
  'Already optimized':'Déjà optimisé',
  'Premium · Limited · 8 h/month · 1 screen':'Premium · Utilisation limitée · 8 h/mois · 1 écran',
  'Premium Individual · High · 46 h/month':'Premium Personnel · Utilisation élevée · 46 h/mois',
  'Photography 1 TB · Inactive · 47 days':'Photographie 1 To · Inactif · 47 jours',
  '2 TB · Moderate · 146 GB used':'2 To · Utilisation modérée · 146 Go utilisés',
  'Comfort · Regular · 11 visits/month':'Comfort · Utilisation régulière · 11 visites/mois',
  '/ 4 weeks':'/ 4 semaines',
  '/ 4 weeks · €19.99 signup fee':'/ 4 semaines · 19,99 € de frais d’inscription',
  '/ month · annual commitment':'/ mois · engagement annuel',
  'OPTIMIZATION AVAILABLE':'OPTIMISATION POSSIBLE',
  'USAGE ALERT':'ALERTE D’UTILISATION',
  'ALREADY OPTIMIZED':'DÉJÀ OPTIMISÉ',
  'POTENTIAL SAVING':'ÉCONOMIE POTENTIELLE',
  'POTENTIAL DOWNGRADE SAVING':'ÉCONOMIE POTENTIELLE EN CHANGEANT DE FORMULE',
  'Cancellation may save more':'La résiliation peut être plus avantageuse',
  'No change recommended':'Aucun changement recommandé',
  'Choose Standard':'Choisir Standard',
  'Choose 200 GB':'Choisir 200 Go',
  'Your usage does not appear to require 4K, spatial audio or simultaneous viewing on four screens.':'Votre utilisation ne semble nécessiter ni la 4K, ni l’audio spatial, ni quatre écrans simultanés.',
  'Your regular offline and ad-free listening makes this plan consistent with your usage.':'Votre écoute régulière, hors connexion et sans publicité, rend cette formule cohérente avec votre usage.',
  'No recent activity was detected. Check the annual commitment conditions before cancelling.':'Aucune activité récente n’a été détectée. Vérifiez les conditions de l’engagement annuel avant de résilier.',
  'Your 146 GB usage fits within the 200 GB plan, including a reasonable storage buffer.':'Votre utilisation de 146 Go reste compatible avec la formule 200 Go, tout en conservant une marge raisonnable.',
  'You already have the least expensive suitable membership and use the gym regularly.':'Vous possédez déjà la formule la moins chère adaptée et utilisez régulièrement la salle.'
});

Object.assign(french, {
  'All':'Tous',
  'PLAN UTILIZATION':'UTILISATION DE LA FORMULE',
  'Limited · 8 h/month · 1 screen':'Limitée · 8 h/mois · 1 écran',
  'High · 46 h/month':'Élevée · 46 h/mois',
  'Inactive · 47 days':'Inactive · 47 jours',
  'Moderate · 146 GB used':'Modérée · 146 Go utilisés',
  'Regular · 11 visits/month':'Régulière · 11 visites/mois',
  'Demo interface · Brand names and amounts are illustrative only. Cancellation availability depends on each provider.':'Interface de démonstration · Les marques et montants sont présentés à titre indicatif. Les possibilités de résiliation dépendent de chaque fournisseur.',
  'A fictional comparable gym membership. Your Basic-Fit plan is already optimized, but this external alternative costs less.':'Un abonnement de salle fictif comparable. Votre formule Basic-Fit est déjà optimisée, mais cette alternative externe coûte moins cher.',
  'Save €5 / 4 weeks · €65 / year':'Économisez 5 € toutes les 4 semaines · 65 € par an'
});

Object.assign(french, {
  'You could replace Netflix with Streamly+':'Vous pourriez remplacer Netflix par Streamly+',
  'You could replace Spotify with Soundly':'Vous pourriez remplacer Spotify par Soundly',
  'You could replace Adobe with CreativeLite':'Vous pourriez remplacer Adobe par CreativeLite',
  'You could replace iCloud+ with Cloudy':'Vous pourriez remplacer iCloud+ par Cloudy',
  'You could replace Basic-Fit with MoveMore':'Vous pourriez remplacer Basic-Fit par MoveMore'
});

Object.assign(french, {
  'GOOD MATCH':'BONNE ALTERNATIVE',
  'BEST MATCH':'MEILLEURE ALTERNATIVE',
  'LOWER PRICE':'PRIX PLUS BAS',
  'STREAMING ALTERNATIVE':'ALTERNATIVE STREAMING',
  'MUSIC ALTERNATIVE':'ALTERNATIVE MUSIQUE',
  'CREATIVE TOOLS ALTERNATIVE':'ALTERNATIVE CRÉATIVE',
  'CLOUD STORAGE ALTERNATIVE':'ALTERNATIVE STOCKAGE CLOUD',
  'FITNESS ALTERNATIVE':'ALTERNATIVE FITNESS',
  'Household streaming with the essentials, without paying for an oversized plan.':'Le streaming essentiel pour le foyer, sans payer une formule surdimensionnée.',
  'Family music streaming with the listening features used most often.':'Le streaming musical familial avec les fonctionnalités réellement utilisées.',
  'The essential creative tools in a simpler, lower-cost monthly plan.':'Les outils créatifs essentiels dans une formule mensuelle plus simple et moins chère.',
  'Simple household cloud storage with enough space for everyday files.':'Un stockage cloud familial simple, adapté aux fichiers du quotidien.',
  'A comparable gym plan that costs less, even though your current plan already fits your usage.':'Une formule de sport comparable et moins chère, même si votre abonnement actuel correspond déjà à votre usage.',
  'CURRENT · NETFLIX':'ACTUEL · NETFLIX',
  'CURRENT · SPOTIFY':'ACTUEL · SPOTIFY',
  'CURRENT · ADOBE':'ACTUEL · ADOBE',
  'CURRENT · ICLOUD+':'ACTUEL · ICLOUD+',
  'CURRENT · BASIC-FIT':'ACTUEL · BASIC-FIT',
  'WITH STREAMLY+':'AVEC STREAMLY+',
  'WITH SOUNDLY':'AVEC SOUNDLY',
  'WITH CREATIVELITE':'AVEC CREATIVELITE',
  'WITH CLOUDY':'AVEC CLOUDY',
  'WITH MOVEMORE':'AVEC MOVEMORE',
  '/ month':'/ mois',
  '/ 4 weeks':'/ 4 semaines',
  'Save €10 / month':'Économisez 10 € / mois',
  'Save €2.55 / month':'Économisez 2,55 € / mois',
  'Save €4.80 / month':'Économisez 4,80 € / mois',
  'Save €2 / month':'Économisez 2 € / mois',
  'Save €5 / 4 weeks':'Économisez 5 € / 4 semaines',
  '€120 / year':'120 € / an',
  '€30.60 / year':'30,60 € / an',
  '€57.60 / year':'57,60 € / an',
  '€24 / year':'24 € / an',
  '€65 / year':'65 € / an',
  'Replace Netflix with Streamly+':'Remplacer Netflix par Streamly+',
  'Replace Spotify with Soundly':'Remplacer Spotify par Soundly',
  'Replace Adobe with CreativeLite':'Remplacer Adobe par CreativeLite',
  'Replace iCloud+ with Cloudy':'Remplacer iCloud+ par Cloudy',
  'Replace Basic-Fit with MoveMore':'Remplacer Basic-Fit par MoveMore',
  'Partner code':'Code partenaire'
});

const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode: node => /\S/.test(node.nodeValue) && !['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
});
while (walker.nextNode()) textNodes.push({ node: walker.currentNode, original: walker.currentNode.nodeValue });

const languageToggle = document.querySelector('.language-toggle');
Object.assign(french, {
  'All your money.':'Tout votre argent.',
  'Finally readable.':'Enfin lisible.',
  'Understand the whole household before making a decision. Accounts, savings and commitments stay clear, separate and connected.':'Comprenez l’ensemble du foyer avant de décider. Comptes, épargne et engagements restent clairs, séparés et connectés.',
  'Explore the household':'Explorer le foyer',
  'View-only · Your banks stay in control':'Consultation seule · Vos banques gardent le contrôle',
  'HOUSEHOLD BALANCE':'SOLDE DU FOYER',
  'profiles consolidated':'profils consolidés',
  'THIS MONTH':'CE MOIS-CI',
  'Everyday':'Quotidien',
  'Recurring':'Récurrent',
  'MAIN PROFILE':'PROFIL PRINCIPAL',
  'BUDGET & GOALS':'BUDGET ET OBJECTIFS',
  'Your projects':'Vos projets',
  'deserve a plan.':'méritent un plan.',
  'See where every euro goes, protect what matters and turn a monthly rhythm into visible progress.':'Voyez où part chaque euro, protégez ce qui compte et transformez votre rythme mensuel en progression visible.',
  'Open the budget':'Ouvrir le budget',
  'One trajectory · Shared by the household':'Une trajectoire · Partagée par le foyer',
  'FAMILY PROJECT':'PROJET DU FOYER',
  'NEXT MILESTONE':'PROCHAINE ÉTAPE',
  'Book the house':'Réserver le logement',
  'this month':'ce mois-ci',
  'KOTIZ MARKET':'BOUTIQUE KOTIZ',
  'Our partners’ best offers':'Les meilleures offres de nos partenaires',
  'for your household.':'pour votre foyer.',
  'Benefits negotiated with our selected partners, matched to your real usage — while you stay completely free to choose.':'Des avantages négociés avec nos partenaires sélectionnés, adaptés à vos usages réels — tout en vous laissant entièrement libre de choisir.',
  'SELECTED KOTIZ PARTNERS':'NOS PARTENAIRES KOTIZ SÉLECTIONNÉS',
  'Relevant offers · Clear benefits · No obligation':'Offres pertinentes · Avantages clairs · Sans engagement',
  'KOTIZ PARTNER':'PARTENAIRE KOTIZ',
  'PARTNER MATCH':'MATCH PARTENAIRE',
  'Pay less.':'Payez moins.',
  'Keep what matters.':'Gardez l’essentiel.',
  'Every recurring payment becomes visible, comparable and actionable — without deciding for you.':'Chaque paiement récurrent devient visible, comparable et actionnable — sans jamais décider à votre place.',
  'Review subscriptions':'Voir les abonnements',
  'services monitored':'services suivis',
  'opportunities':'opportunités',
  'RECOMMENDED PLAN':'FORMULE RECOMMANDÉE',
  'PRICE UP':'PRIX EN HAUSSE',
  'OPTIMIZED':'OPTIMISÉ',
  'EVERY MONTH':'CHAQUE MOIS',
  'Better match found':'Meilleure offre trouvée',
  'THE KOTIZ VISION':'LA VISION KOTIZ',
  'A financial co-pilot.':'Un copilote financier.',
  'Built around real life.':'Pensé autour de la vraie vie.',
  'From one clear decision to a lasting household habit, Kotiz connects people, plans and opportunities in a single continuous loop.':'D’une décision claire à une habitude durable, Kotiz relie les personnes, les projets et les opportunités dans une même dynamique.',
  'Discover the model':'Découvrir le modèle',
  'Clarity · Fairness · Action':'Clarté · Équité · Action',
  'Understand':'Comprendre',
  'One shared view':'Une vue partagée',
  'Decide':'Décider',
  'At the right time':'Au bon moment',
  'Progress':'Progresser',
  'Together':'Ensemble',
  'ONE HOUSEHOLD VIEW':'UNE VUE POUR TOUT LE FOYER',
  'MONTHLY BUDGET':'BUDGET MENSUEL',
  'SAVING DETECTED':'ÉCONOMIE DÉTECTÉE',
  'MOBILE':'MOBILE',
  'INTERNET':'INTERNET',
  'Plan optimized':'Forfait optimisé',
  'PLANS & KOTIZ VISION':'FORMULES ET VISION KOTIZ',
  'Choose how':'Choisissez comment',
  'you save.':'vous économisez.',
  'Start free, choose a fixed price, or share only the savings Kotiz actually creates. One transparent model, designed around your household.':'Commencez gratuitement, choisissez un prix fixe ou partagez uniquement les économies réellement créées par Kotiz. Un modèle transparent, pensé pour votre foyer.',
  'Compare plans':'Comparer les formules',
  'Free · Fixed price · Pay for results':'Gratuit · Prix fixe · Paiement au résultat',
  'YOUR CHOICE':'VOTRE CHOIX',
  'Essential':'Essentiel',
  'Share':'Partage',
  'of savings':'des économies',
  '10% of savings':'10 % des économies',
  '0 € / month':'0 € / mois',
  '5,99 € / month':'5,99 € / mois',
  'WITHOUT SAVINGS':'SANS ÉCONOMIE',
  'YEAR 1':'ANNÉE 1',
  'YEAR 2':'ANNÉE 2',
  'YEAR 3':'ANNÉE 3',
  'Launch, learn and prove our value with early households.':'Lancer le produit, apprendre et démontrer notre valeur auprès des premiers foyers.',
  'Expand the product and build a loyal community.':'Enrichir le produit et construire une communauté fidèle.',
  'Connect banking and become the household money hub.':'Connecter les banques et centraliser les finances du foyer.',
  'Our vision is to become the financial co-pilot':'Notre ambition : devenir le copilote financier',
  'of every modern household.':'de chaque foyer moderne.'
});

Object.assign(french, window.KotizCopy?.fr);
let currentLanguage = 'fr';
try { currentLanguage = localStorage.getItem('kotiz-language') === 'en' ? 'en' : 'fr'; }
catch { /* Language switching also works without browser storage. */ }
const applyLanguage = language => {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.querySelector('#memberName')?.setAttribute('placeholder', language === 'fr' ? 'Nom du membre de la famille' : 'Family member name');
  textNodes.forEach(entry => {
    const { node, original } = entry;
    if (entry.rendered !== undefined && node.nodeValue !== entry.rendered) return;
    const clean = original.trim();
    const translated = language === 'fr' ? french[clean] : window.KotizCopy?.en[clean];
    node.nodeValue = translated ? original.replace(clean, translated) : original;
    entry.rendered = node.nodeValue;
  });
  languageToggle.querySelectorAll('span').forEach(span => span.classList.toggle('lang-active', span.textContent.trim().toLowerCase() === language));
  languageToggle.setAttribute('aria-label', language === 'en' ? 'Passer le site en français' : 'Switch website to English');
  try { localStorage.setItem('kotiz-language', language); }
  catch { /* Keep the current language in memory when storage is blocked. */ }
  updateSubscriptionSummary();
  const requestedRoute = location.hash.slice(1).split('/')[0];
  const normalizedRoute = requestedRoute === 'product' ? 'savings' : requestedRoute === 'offers' || requestedRoute === 'subscriptions' ? 'abonnement' : requestedRoute;
  const route = validRoutes.includes(normalizedRoute) ? normalizedRoute : 'home';
  const frenchTitles = { home: 'Accueil', finance: 'Finance', savings: 'Économies', demo: 'Démo produit', abonnement: 'Optimisations', vision: 'Vision' };
  document.title = language === 'fr' ? `${frenchTitles[route]} — Kotiz` : routeTitles[route];
  document.dispatchEvent(new CustomEvent('kotiz:languagechange', {detail:language}));
};
const updateAlternativeSummary = () => {
  const summary = document.querySelector('#alternativeSummary');
  const [requestedRoute, encodedProvider, savingValue] = location.hash.slice(1).split('/');
  const route = requestedRoute === 'offers' || requestedRoute === 'subscriptions' ? 'abonnement' : requestedRoute;
  if (!summary || route !== 'abonnement' || !encodedProvider || !savingValue) {
    if (summary) summary.hidden = true;
    document.querySelectorAll('[data-offer-category]').forEach(card => {
      card.classList.remove('context-match');
      card.classList.remove('hidden');
    });
    return;
  }
  let provider;
  try { provider = decodeURIComponent(encodedProvider); }
  catch { summary.hidden = true; return; }
  const monthly = Number(savingValue);
  const annual = monthly * 12;
  const french = document.documentElement.lang === 'fr';
  summary.hidden = false;
  document.querySelector('#alternativeTitle').textContent = french ? `Économie estimée pour ${provider}` : `Estimated savings for ${provider}`;
  document.querySelector('#alternativeDetails').textContent = french ? `Vous économisez €${monthly.toFixed(2)} par mois, soit €${annual.toFixed(2)} par an.` : `You save €${monthly.toFixed(2)} per month, or €${annual.toFixed(2)} per year.`;
  document.querySelector('#alternativeMonthly').textContent = `€${monthly.toFixed(2)}`;
  document.querySelector('.alternative-saving>span').textContent = french ? '/ mois' : '/ month';
  document.querySelector('#alternativeAnnual').textContent = french ? `€${annual.toFixed(2)} / an` : `€${annual.toFixed(2)} / year`;
  const matchingOffer = [...document.querySelectorAll('[data-offer-category]')].find(card => card.dataset.match === provider);
  document.querySelectorAll('[data-offer-category]').forEach(card => {
    const match = card === matchingOffer;
    card.classList.toggle('context-match', match);
    card.classList.toggle('hidden', !match);
  });
  requestAnimationFrame(() => matchingOffer?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
};
let activeReplacement = null;
const renderReplacementSummary = () => {
  if (!activeReplacement) return;
  const summary = document.querySelector('#alternativeSummary');
  if (!summary) return;
  const { current, replacement, saving, cycle } = activeReplacement;
  const isFrench = document.documentElement.lang === 'fr';
  const cyclesPerYear = cycle === '4weeks' ? 13 : 12;
  const cycleLabel = cycle === '4weeks'
    ? (isFrench ? '/ 4 semaines' : '/ 4 weeks')
    : (isFrench ? '/ mois' : '/ month');
  const annual = saving * cyclesPerYear;

  summary.hidden = false;
  document.querySelector('#alternativeTitle').textContent = `${current} → ${replacement}`;
  document.querySelector('#alternativeDetails').textContent = isFrench
    ? `Vous pourriez remplacer ${current} par ${replacement}. Comparez les services avant de choisir : cette recommandation reste facultative et transparente.`
    : `You could replace ${current} with ${replacement}. Compare the services before choosing: this recommendation remains optional and transparent.`;
  document.querySelector('#alternativeMonthly').textContent = `€${saving.toFixed(2)}`;
  document.querySelector('.alternative-saving>span').textContent = cycleLabel;
  document.querySelector('#alternativeAnnual').textContent = isFrench
    ? `€${annual.toFixed(2)} / an`
    : `€${annual.toFixed(2)} / year`;
};

document.querySelectorAll('.replace-suggestion').forEach(button => {
  button.addEventListener('click', () => {
    activeReplacement = {
      current: button.dataset.current,
      replacement: button.dataset.replacement,
      saving: Number(button.dataset.saving),
      cycle: button.dataset.cycle
    };
    document.querySelectorAll('.offer-card').forEach(card => card.classList.remove('replacement-selected'));
    button.closest('.offer-card')?.classList.add('replacement-selected');
    renderReplacementSummary();
    requestAnimationFrame(() => document.querySelector('#alternativeSummary')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  });
});
document.addEventListener('click', event => {
  const button = event.target.closest('.alternative-sub');
  if (!button) return;
  event.preventDefault();
  const row = button.closest('[data-subscription]');
  const provider = row.querySelector('.service-name strong').textContent.trim();
  history.pushState({}, '', `#abonnement/${encodeURIComponent(provider)}/${button.dataset.alternativeSaving}`);
  renderRoute();
  applyLanguage(currentLanguage);
  updateAlternativeSummary();
}, true);
languageToggle.addEventListener('click', () => {
  applyLanguage(currentLanguage === 'en' ? 'fr' : 'en');
  if (activeReplacement) renderReplacementSummary();
  else updateAlternativeSummary();
});
applyLanguage(currentLanguage);
updateAlternativeSummary();
window.addEventListener('hashchange', () => setTimeout(() => applyLanguage(currentLanguage), 0));
window.addEventListener('hashchange', () => {
  activeReplacement = null;
  document.querySelectorAll('.offer-card').forEach(card => card.classList.remove('replacement-selected'));
  setTimeout(updateAlternativeSummary, 0);
});
document.querySelectorAll('[data-scroll-to]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('main').focus();
  document.querySelector('main').scrollIntoView({behavior:'instant'});
});

// Keep keyboard focus inside the active dialog and support Escape consistently.
document.addEventListener('keydown', event => {
  const dialog = document.querySelector('#cancelModal.open, #demoDrawer:not([hidden])');
  if (!dialog) return;
  if (event.key === 'Escape') {
    if (dialog === cancelModal) closeCancelModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href],input,select,[tabindex="0"]')]
    .filter(el => el.getClientRects().length && !el.classList.contains('drawer-backdrop'));
  const first = controls[0], last = controls.at(-1);
  if (!first) return;
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
});

window.addEventListener('hashchange', () => {
  cancelModal?.classList.remove('open');
  document.querySelectorAll('.manage-menu.open').forEach(menu => menu.classList.remove('open'));
});
