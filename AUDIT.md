Audit du site Kotiz — 7 septembre 2026

Les corrections portent sur les six pages du prototype, leur adaptation aux écrans, les parcours interactifs, les traductions et la préparation des fichiers à publier.

| Problème constaté | Correction |
| --- | --- |
| Bande vide à droite des bandeaux sur mobile | Largeur calculée en tenant compte des marges de la section. |
| Colonnes Vision trop étroites sur tablette | Modèle économique, feuille de route et comparateur empilés aux largeurs intermédiaires. |
| Titres de tailles différentes sur ordinateur | Taille, interligne et alignement communs aux introductions. |
| Liens du burger réduits à 12 px par une règle pour ordinateur | DM Sans avec polices de repli, 22–30 px ; 20 px en paysage de faible hauteur. |
| Menu fermé encore accessible au clavier | Gestion de `inert`, focus initial, fermeture avec Échap et retour au bouton. |
| Cartes de la démo écrasées sur petit écran | Une colonne sur mobile, contenus internes pouvant revenir à la ligne. |
| Filtres et onglets masqués hors écran | Retours à la ligne et grille d’onglets avec libellés visibles. |
| Accents corrompus et traductions manquantes | Dictionnaire complémentaire centralisé ; comparateur et sélection de formule traduits. Français par défaut. |
| Police de substitution avec empattements lorsque Google Fonts échoue | Polices sans empattement de repli dans les déclarations Manrope. |
| Préférences invalides ou stockage inaccessible | Validation de la formule enregistrée et fonctionnement en mémoire sans stockage. |
| Titres `undefined` sur certaines routes | Valeur de repli et titre de la démo ajoutés. |
| Changement de langue annulant certains états d’interface | Conservation des textes modifiés par une action utilisateur. |
| Réinitialisation laissant les dépenses ajoutées dans la démo | Restauration de la liste initiale des transactions. |
| Affectation d’épargne insuffisamment liée à Netflix | Vérification de l’optimisation Netflix et calcul de son économie propre. |
| Dialogues incomplets au clavier | Focus initial, maintien du focus dans le dialogue, fermeture et nettoyage à la navigation. |
| Promesse de paiement ambiguë | La rémunération aux résultats est explicitement associée à Kotiz Partage. |
| Import et résiliation présentés comme réels | Explication explicite du fonctionnement simulé. |
| Confirmation de copie même en cas d’échec | Message de succès uniquement lorsque la copie réussit. |
| Fichiers étrangers au site dans le dépôt | Export par liste de fichiers autorisés vers `dist/`. |

Validation réalisée dans Edge/Chromium avec émulation de dimensions : 320×568, 390×844, 650×900, 701×900, 900×700, 1024×768, 1440×900, 2560×1440 et 844×390. Les six routes ont été parcourues en français et en anglais, soit 108 combinaisons. Aucun débordement de texte, image manquante ou bouton visible sans libellé n’a été détecté dans ces contrôles.

Douze états interactifs supplémentaires ont été vérifiés à 320×568 et 800×600 : ajout et profil d’un membre, analyse et résiliation d’abonnement, tarification, six onglets de la démo et dialogue d’optimisation. Aucun débordement de contenu détecté après stabilisation des animations. Les huit tests du menu passent en portrait et en paysage. Les 27 tests fonctionnels passent également avec le stockage bloqué et avec une préférence de formule invalide, sans erreur JavaScript capturée.

Les tests automatiques de mise en page bloquent Google Fonts afin de vérifier aussi les polices de repli. Des captures de Vision et du menu ont été examinées. Ces contrôles ne constituent pas un test sur chaque appareil physique, ni une validation Safari/iOS ou Firefox.

Le site reste un prototype : aucune connexion bancaire, résiliation réelle, analyse de relevé ou souscription payante n’a été ajoutée. La démo interactive reste en français, avec son attribut de langue explicite. Les données et les offres d’exemple ne sont pas des tarifs commerciaux vérifiés.

Pour préparer la publication, exécuter `powershell -NoProfile -ExecutionPolicy Bypass -File export-site.ps1`, puis publier uniquement `dist/` (17 fichiers, environ 1,8 Mo). Les profils de test, PDF et installateurs déjà présents dans le dépôt ne sont ni copiés ni supprimés. L’export n’a pas été déployé.

Les scripts de vérification et les résultats de dimensions se trouvent dans `.audit/`. Ils utilisent un navigateur de test local accessible sur le port 9223.
