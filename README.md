# Open Mosque MVP

Application statique gratuite pour lancer des campagnes locales Open Mosque.

## Fonctionnalites

- Page publique bilingue francais/anglais.
- Accueil multi-mosquees avec barre de recherche.
- Parcours d'accueil direct: rechercher une mosquee, cliquer, participer.
- Page mosquee optimisee mobile avec compteur, formulaire rapide et partage direct.
- Bibliotheque privee de presets de mosquees pour le super admin.
- Photo propre a chaque mosquee, configurable depuis l'espace responsable.
- Ville, adresse et site web affichables pour identifier clairement la mosquee.
- Formulaire d'intention pour inviter une ou plusieurs personnes non musulmanes.
- Limite anti-abus: une intention par courriel et maximum 5 invites par intention.
- Rate-limit public cote Supabase pour reduire les inscriptions spammees.
- Compteur public vers l'objectif de la campagne.
- QR code genere depuis l'URL courante de la campagne.
- Boutons de partage pour WhatsApp et copie du lien propre de la campagne.
- Affiche imprimable par campagne: `poster.html?campaign=slug`.
- Espace responsable avec authentification Supabase.
- Super administration multi-mosquees.
- Creation, modification, activation et suppression de campagnes.
- Creation d'un nouveau round depuis une mosquee existante: compteur vide,
  nouveau lien public et reinscription possible pour les memes courriels.
- Date limite optionnelle pour les inscriptions.
- Attribution ou retrait d'un responsable local limite a une seule mosquee.
- URL distincte pour chaque mosquee: `?campaign=slug`.
- Donnees protegees par Row Level Security.
- Suppression automatique des coordonnees 30 jours apres l'evenement.

## Lancer localement

Depuis ce dossier:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Puis ouvrir l'accueil principal:

```text
http://127.0.0.1:8000/
```

Ou ouvrir directement une campagne:

```text
http://127.0.0.1:8000/?campaign=laval
```

Affiche imprimable:

```text
http://127.0.0.1:8000/poster.html?campaign=laval
```

## Supabase

Le projet est connecte au projet Supabase `Open Mosque`:

```text
https://whtkzdicqyedqjjdjhqg.supabase.co
```

Le fichier `config.js` contient uniquement la cle Publishable, qui est normale dans un site public. Ne jamais ajouter la cle `service_role` dans ce dossier.

Le schema SQL est dans:

```text
supabase/schema.sql
```

Si la base existe deja, appliquer cette migration pour activer l'accueil
multi-mosquees dynamique et les photos de mosquees:

```text
supabase/add-campaign-photos.sql
```

Cette migration cree:

- la colonne `campaigns.photo_url`;
- le bucket public `campaign-photos`;
- les policies Storage pour que seuls le super admin ou le responsable local
  puissent uploader/modifier la photo de leur mosquee;
- la RPC publique `list_public_campaigns`;
- la RPC publique `get_public_campaign` mise a jour pour retourner `photo_url`.

Pour une base deja migree avec les photos, appliquer aussi:

```text
supabase/add-mosque-profile-fields.sql
```

Cette migration ajoute `address`, `city` et `website_url`, puis met a jour les
RPC publiques pour retourner ces champs.

Pour rendre la date limite optionnelle, appliquer:

```text
supabase/add-optional-deadline.sql
```

Sans date limite, les inscriptions restent ouvertes tant que la campagne est
visible publiquement.

Pour renforcer le compteur contre le spam, appliquer aussi:

```text
supabase/add-pledge-anti-spam.sql
```

Cette migration limite chaque intention a 5 invites maximum, garde une seule
intention par courriel et ajoute une limite de tentatives par appareil/reseau
sur une courte periode. L'empreinte utilisee pour cette limite est hashee; elle
ne stocke pas l'adresse IP brute.

La migration suivante reste disponible seulement si tu veux activer la liste
publique sans la fonctionnalite photo:

```text
supabase/add-public-campaign-directory.sql
```

Sans ces migrations, l'accueil fonctionne quand meme en fallback avec la campagne
par defaut, mais il ne peut pas encore lister automatiquement toutes les campagnes.

Super administrateur actuel:

```text
maguirio8@gmail.com
```

## Deploiement GitHub Pages

Option simple:

1. Creer un repo GitHub pour Open Mosque.
2. Copier le contenu de ce dossier `outputs/open-mosque` a la racine du repo.
3. Verifier que `.nojekyll` est present.
4. Push sur GitHub.
5. Dans GitHub: Settings -> Pages -> Deploy from branch.
6. Choisir la branche `main` et le dossier `/root`.
7. Ouvrir l'URL GitHub Pages avec `?campaign=laval`.

Exemple:

```text
https://TON-NOM.github.io/open-mosque/?campaign=laval
```

Le QR code utilisera automatiquement l'URL GitHub Pages ouverte dans le navigateur.

La page principale sans parametre devient l'accueil de recherche:

```text
https://TON-NOM.github.io/open-mosque/
```

## Checklist avant vrai lancement

- Confirmer le nom officiel de la premiere mosquee.
- Confirmer la date de l'evenement.
- Confirmer la date limite d'inscription.
- Confirmer l'objectif d'invites.
- Confirmer le texte repas/contribution.
- Ajouter une photo officielle pour chaque mosquee.
- Appliquer `supabase/add-pledge-anti-spam.sql` dans Supabase.
- Pour une deuxieme journee Open Mosque, utiliser "Creer le prochain round"
  dans le super admin au lieu de reutiliser l'ancien compteur.
- Tester la page sur mobile.
- Imprimer un test de `poster.html?campaign=laval`.
- Supprimer les campagnes de test creees pendant les essais.

## Notes de securite

- La cle Publishable Supabase peut etre publique.
- Les inscriptions passent par `submit_pledge`.
- Les responsables voient seulement leurs campagnes, sauf super admin.
- Les donnees personnelles des pledges sont supprimees automatiquement apres l'evenement selon la tache Cron.
