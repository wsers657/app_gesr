window.KotizPricing = (() => {
  const plans = {
    essential: { id:'essential', name:'Kotiz Essentiel', monthly:0, optimization:false },
    plus: { id:'plus', name:'Kotiz Plus', monthly:5.99, optimization:true },
    share: { id:'share', name:'Kotiz Partage', monthly:0, rate:0.10, annualCap:120, optimization:true }
  };
  const savings = [
    { id:'mobile', label:'Forfait mobile', icon:'▥', amount:240 },
    { id:'internet', label:'Internet', icon:'⌁', amount:96 },
    { id:'energy', label:'Énergie', icon:'ϟ', amount:132 },
    { id:'home', label:'Assurance habitation', icon:'⌂', amount:72 },
    { id:'digital', label:'Abonnements numériques', icon:'N', amount:60 },
    { id:'bank', label:'Frais bancaires', icon:'€', amount:40 }
  ];
  const annualCost = (planId, generatedSavings) => {
    const saving = Math.max(0, Number(generatedSavings) || 0);
    if (planId === 'plus') return plans.plus.monthly * 12;
    if (planId === 'share') return Math.min(saving * plans.share.rate, plans.share.annualCap);
    return 0;
  };
  const breakEven = plans.plus.monthly * 12 / plans.share.rate;
  const recommendation = generatedSavings => generatedSavings > breakEven ? 'plus' : 'share';
  const totalSavings = savings.reduce((sum, item) => sum + item.amount, 0);
  return { plans, savings, annualCost, breakEven, recommendation, totalSavings };
})();
