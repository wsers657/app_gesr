window.KotizDemo = (() => {
  const subscriptions = [
    { id:'netflix', service:'Netflix', logo:'images/netflix_logo.jpg', plan:'Premium', price:21.99, billing:'monthly', usage:{ label:'Faible', detail:'8 h ce mois-ci · 1 écran principalement', score:28 }, availablePlans:[{name:'Standard',price:14.99,billing:'monthly'},{name:'Premium',price:21.99,billing:'monthly'}], recommendedPlan:'Standard', reason:'Vous utilisez principalement Netflix sur un seul écran. Votre activité récente ne nécessite ni quatre écrans simultanés, ni les avantages principaux de Premium.', status:'optimization_available' },
    { id:'spotify', service:'Spotify', logo:'images/spotify_logo.webp', plan:'Personnel', price:11.99, billing:'monthly', usage:{ label:'Régulière', detail:'19 jours actifs ce mois-ci', score:76 }, availablePlans:[{name:'Personnel',price:11.99,billing:'monthly'}], recommendedPlan:null, reason:'Votre formule correspond à votre rythme d’écoute.', status:'optimized' },
    { id:'basicfit', service:'Basic-Fit', logo:'images/Basic-Fit_logo.png', plan:'Comfort', price:24.99, billing:'four_weeks', usage:{ label:'Régulière', detail:'11 visites sur les 4 dernières semaines', score:84 }, availablePlans:[{name:'Comfort',price:24.99,billing:'four_weeks'}], recommendedPlan:null, reason:'Votre abonnement actuel est déjà le moins cher adapté à votre utilisation régulière.', status:'optimized' },
    { id:'icloud', service:'iCloud+', logo:'images/icloud_logo.png', plan:'2 To', price:9.99, billing:'monthly', usage:{ label:'Adaptée', detail:'1,6 To utilisés', score:82 }, availablePlans:[{name:'2 To',price:9.99,billing:'monthly'}], recommendedPlan:null, reason:'Votre stockage utilisé justifie la formule actuelle.', status:'optimized' },
    { id:'adobe', service:'Adobe', logo:'images/adobe_logo.png', plan:'Photographie', price:23.99, billing:'monthly', usage:{ label:'À surveiller', detail:'Données récentes insuffisantes', score:42 }, availablePlans:[{name:'Photographie',price:23.99,billing:'monthly'}], recommendedPlan:null, reason:'Nous attendons davantage de données avant de formuler une recommandation.', status:'review' }
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const monthlyEquivalent = item => item.billing === 'four_weeks' ? item.price * 13 / 12 : item.price;
  const recommended = item => item.availablePlans.find(plan => plan.name === item.recommendedPlan);
  const monthlySaving = item => item.status === 'optimization_available' && recommended(item) ? Math.max(0, monthlyEquivalent(item) - monthlyEquivalent(recommended(item))) : 0;
  const totals = items => ({ active:items.length, monthly:items.reduce((sum,item)=>sum+monthlyEquivalent(item),0), potential:items.reduce((sum,item)=>sum+monthlySaving(item),0) });
  const applyOptimization = (items,id) => items.map(item => {
    if(item.id !== id || !recommended(item)) return item;
    const plan = recommended(item);
    return {...item, plan:plan.name, price:plan.price, billing:plan.billing, recommendedPlan:null, status:'optimized', optimized:true, reason:'Votre formule est maintenant adaptée à votre usage.'};
  });
  return { initial:clone(subscriptions), reset:()=>clone(subscriptions), monthlyEquivalent, monthlySaving, totals, applyOptimization };
})();
