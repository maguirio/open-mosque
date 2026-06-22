# Open Mosque Launch Checklist

## Status actuel

- Site GitHub Pages en ligne.
- Accueil public multi-mosquees actif.
- Aucune campagne publique active pour le moment.
- Supabase SQL applique, incluant phases et historique des messages.
- Edge Function `send-campaign-message` deployee.
- Secrets Supabase configures pour Resend.
- Cle Resend dediee creee: `open-mosque-supabase`.
- Aucun domaine Resend verifie pour l'instant.

## Avant une vraie campagne

1. Obtenir l'accord clair de la mosquee.
2. Dans le super admin, completer:
   - nom officiel;
   - adresse;
   - site web;
   - photo officielle;
   - objectif d'invites;
   - date d'evenement;
   - date limite, si necessaire;
   - informations repas/contribution.
3. Mettre la phase a `Inscription ouverte`.
4. Cocher `Visible publiquement`.
5. Tester le lien public sur mobile.
6. Generer/imprimer l'affiche avec le QR.

## Courriels

1. Verifier un domaine dans Resend avant le vrai lancement.
2. Remplacer `OPEN_MOSQUE_FROM_EMAIL` dans Supabase par une adresse officielle.
3. Faire un test email avec un participant test.
4. Utiliser le bouton `Envoyer aux participants` seulement quand le message est relu.

## Test terrain recommande

1. Creer ou utiliser une mosquee test en brouillon.
2. La rendre publique temporairement.
3. Ajouter une intention avec ton propre courriel.
4. Envoyer un message test.
5. Verifier la reception et l'apparence du courriel.
6. Remettre la mosquee test en brouillon ou la supprimer.

## A ne pas oublier

- Ne pas activer une mosquee sans accord.
- Ne pas reutiliser un vieux round pour une nouvelle journee: creer une nouvelle edition.
- Ne pas mettre `RESEND_API_KEY` dans GitHub Pages ou dans `config.js`.
- Garder les vrais participants dans une campagne/round precise.
