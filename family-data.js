window.KotizFamilyData = (() => {
  const members = [
    {
      id:'julie', name:'Julie', initial:'J', color:'green', role:'owner', access:'shared', institutionCount:5, featured:true,
      products:[
        {id:'julie-current',name:'Compte courant',type:'banking',institution:'BNP Paribas',balance:3850,status:['active','shared'],indicator:'+ 420 € ce mois',tone:'blue'},
        {id:'julie-livret',name:'Livret A',type:'savings',institution:'BNP Paribas',balance:8240,status:['active'],indicator:'Objectif sécurité · 82 %',tone:'cyan'},
        {id:'julie-life',name:'Assurance-vie Horizon',type:'investments',institution:'Linxea',balance:12680,status:['view'],indicator:'+ 6,8 % sur 12 mois',tone:'purple'},
        {id:'julie-card',name:'Carte Visa Premier',type:'banking',institution:'BNP Paribas',monthlyCost:14.90,status:['active'],indicator:'Débit différé · 24 sept.',tone:'blue'},
        {id:'julie-mobile',name:'Forfait mobile famille',type:'subscriptions',institution:'Sosh',monthlyCost:29.99,status:['shared','recurring'],indicator:'3 lignes incluses',tone:'yellow'},
        {id:'julie-netflix',name:'Netflix Standard',type:'subscriptions',institution:'Netflix',monthlyCost:14.99,status:['shared','recurring'],indicator:'Formule optimisée',tone:'pink'},
        {id:'julie-spotify',name:'Spotify Duo',type:'subscriptions',institution:'Spotify',monthlyCost:17.99,status:['shared','recurring'],indicator:'2 comptes actifs',tone:'cyan'},
        {id:'julie-home',name:'Assurance habitation',type:'insurance',institution:'MAIF',monthlyCost:28.40,status:['active','due'],indicator:'Échéance · 12 sept.',tone:'coral'}
      ]
    },
    {
      id:'thomas', name:'Thomas', initial:'T', color:'blue', role:'member', access:'shared', institutionCount:6, featured:true,
      products:[
        {id:'thomas-current',name:'Compte de chèques',type:'banking',institution:'Crédit Agricole',balance:2480,status:['active','shared'],indicator:'Salaire reçu · 31 août',tone:'blue'},
        {id:'thomas-pea',name:'PEA',type:'investments',institution:'Boursobank',balance:9560,status:['view'],indicator:'+ 11,2 % depuis ouverture',tone:'purple'},
        {id:'thomas-ldds',name:'LDDS',type:'savings',institution:'Crédit Agricole',balance:4180,status:['active'],indicator:'41 % de l’objectif',tone:'cyan'},
        {id:'thomas-car',name:'Crédit auto',type:'credits',institution:'Crédit Agricole',liability:8900,monthlyCost:287.50,status:['active','due'],indicator:'32 mensualités restantes',tone:'coral'},
        {id:'thomas-mobile',name:'Forfait mobile 5G',type:'subscriptions',institution:'Free',monthlyCost:19.99,status:['recurring'],indicator:'156 Go utilisés',tone:'yellow'},
        {id:'thomas-gym',name:'Basic-Fit Comfort',type:'subscriptions',institution:'Basic-Fit',monthlyCost:27.07,status:['active','recurring'],indicator:'11 visites · déjà optimisé',tone:'pink'},
        {id:'thomas-canal',name:'CANAL+ Ciné Séries',type:'subscriptions',institution:'CANAL+',monthlyCost:29.99,status:['active','recurring'],indicator:'Utilisé 9 jours ce mois',tone:'purple'}
      ]
    },
    {
      id:'emma', name:'Emma', initial:'E', color:'yellow', role:'child', access:'limited', institutionCount:3, featured:false,
      products:[
        {id:'emma-young',name:'Livret Jeune',type:'savings',institution:'BNP Paribas',balance:1240,status:['minor','view'],indicator:'+ 40 € ce mois',tone:'cyan'},
        {id:'emma-current',name:'Compte courant jeune',type:'banking',institution:'BNP Paribas',balance:340,status:['minor','view'],indicator:'Plafond · 100 € / semaine',tone:'blue'},
        {id:'emma-project',name:'Épargne permis',type:'savings',institution:'Kotiz Objectifs',balance:680,status:['minor','shared'],indicator:'68 % de l’objectif',tone:'purple'},
        {id:'emma-card',name:'Carte Origin',type:'banking',institution:'BNP Paribas',monthlyCost:0,status:['active','minor'],indicator:'Autorisation systématique',tone:'blue'},
        {id:'emma-mobile',name:'Forfait mobile étudiant',type:'subscriptions',institution:'B&You',monthlyCost:9.99,status:['recurring','minor'],indicator:'Renouvellement · 18 sept.',tone:'yellow'},
        {id:'emma-transit',name:'Navigo Imagine R',type:'subscriptions',institution:'Île-de-France Mobilités',monthlyCost:31.60,status:['recurring','minor'],indicator:'Zones 1–5 · scolaire',tone:'coral'}
      ]
    }
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const summarize = member => {
    const assets=member.products.reduce((sum,p)=>sum+(p.balance||0),0);
    const liabilities=member.products.reduce((sum,p)=>sum+(p.liability||0),0);
    const recurring=member.products.reduce((sum,p)=>sum+(p.monthlyCost||0),0);
    const available=member.products.filter(p=>p.type==='savings').reduce((sum,p)=>sum+(p.balance||0),0);
    return {assets,liabilities,net:assets-liabilities,recurring,available,accounts:member.products.length};
  };
  return {members:clone(members),summarize,clone};
})();
