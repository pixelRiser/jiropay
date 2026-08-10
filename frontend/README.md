# JiroPay Connect

Plateforme SaaS de paiement JIRAMA — Spécification fonctionnelle

1. Contexte et objectif

La plateforme met en relation trois acteurs autour du paiement des factures JIRAMA. Le paiement réel à JIRAMA reste manuel, effectué par l'admin via un TPE (terminal de paiement électronique) physique, car le contrat avec le fournisseur du matériel interdit toute automatisation de cet achat.

Il y a deux flux d'argent distincts à ne pas confondre :

Flux entrant : l'argent du client arrive sur la plateforme via Orange Money ou Mvola.

Flux sortant : l'admin paie JIRAMA manuellement via le TPE, puis enregistre et valide le reçu obtenu.

Un système de commission récompense le guichet qui a inscrit un client sur la plateforme, sur chaque paiement de ce client — que le paiement passe par le guichet ou soit fait directement par le client.

2. Rôles et permissions

Rôle Description Peut faire Client Utilisateur final qui règle sa facture JIRAMA Créer un compte, entrer ses propres infos (n° compteur, montant), payer via Orange Money/Mvola, consulter ses reçus Guichet Point de collecte, agit pour ses propres clients Enregistrer un client, saisir les infos du compteur pour lui, transmettre la demande de paiement à l'admin, suivre ses commissions Admin Point central de traitement Reçoit les demandes de paiement (infos + argent confirmé), paie JIRAMA manuellement via TPE, saisit et valide le reçu TPE, déclenche l'envoi du reçu au bon compte, supervise les commissions

Point clé du modèle : chaque client est rattaché à un guichet référent (celui qui l'a inscrit sur la plateforme). Ce rattachement génère une commission pour le guichet sur chaque paiement du client, même si le client paie lui-même en direct, sans intervention du guichet.

3. Modèle de données

guichets

Champ Type Description id uuid nom text lieu text statut text actif / inactif solde_commission numeric commissions accumulées non encore reversées created_at timestamp

utilisateurs (agents de guichet et admins)

Champ Type Description id uuid lié à l'authentification nom text role text agent / admin guichet_id uuid (nullable) requis si role = agent telephone text

clients

Champ Type Description id uuid nom text telephone text email text (nullable) numero_abonne_jirama text n° compteur / police JIRAMA adresse text guichet_referent_id uuid le guichet qui a inscrit ce client — sert de base au calcul de commission created_at timestamp

factures

Champ Type Description id uuid client_id uuid mois_facture date (YYYY-MM) montant_du numeric statut text en_attente / paye_plateforme / paye_jirama / valide

paiements

Représente le flux entrant — l'argent que le client (ou le guichet en son nom) verse à la plateforme.

Champ Type Description id uuid facture_id uuid client_id uuid guichet_referent_id uuid copié depuis clients au moment du paiement, pour garder une trace historique même si le rattachement change plus tard initiateur text client (paiement direct) / guichet (paiement pour son client) methode text orange_money / mvola montant numeric total réglé par le client = montant de la facture + frais (détail de la répartition dans commissions) reference_mobile_money text identifiant de transaction renvoyé par l'API Orange Money/Mvola statut_mobile_money text en_attente / confirme / echoue date_paiement timestamp

paiements_jirama (le flux sortant — équivalent de l'ancien "transactions_tpe")

Champ Type Description id uuid paiement_id uuid lié au paiement entrant correspondant numero_transaction_tpe text numéro imprimé sur le reçu papier du TPE montant_tpe numeric saisi_par_admin_id uuid date_saisie timestamp statut_validation text en_attente / validee / rejetee

guichets — champs complémentaires pour la règle de frais

Champ Type Description zone text ville / hors_ville montant_frais_defaut numeric valeur par défaut selon la zone (200 Ar en ville, 500 Ar hors ville), modifiable par l'admin par guichet montant_commission_defaut numeric part reversée au guichet sur ces frais (200 Ar en ville, 400 Ar hors ville)

commissions

Le client paie toujours montant de la facture + frais. Les frais se répartissent entre part plateforme et commission guichet. Les montants sont ceux du guichet référent au moment de la transaction — figés ici pour garder un historique fiable même si l'admin change les montants du guichet plus tard.

Champ Type Description id uuid paiement_id uuid guichet_id uuid montant_facture numeric montant JIRAMA dû, ex. 1 500 Ar montant_frais numeric frais payés par le client en plus, figé au moment du paiement, ex. 200 ou 500 Ar part_plateforme numeric part des frais gardée par la plateforme, figée, ex. 1 500 ou 1 600 Ar au total selon le cas montant_commission numeric part des frais reversée au guichet référent, figée, ex. 200 ou 400 Ar statut text creditee / reversee created_at timestamp

recus

Champ Type Description id uuid paiement_id uuid numero_recu text date_emission timestamp destinataire text compte_client / compte_guichet envoye boolean

4. Flux principaux

Flux A — Client s'inscrit et paie lui-même en ligne

Le client crée son compte (ou est déjà inscrit) et entre lui-même ses informations : n° compteur, mois facturé, montant.

Il choisit Orange Money ou Mvola et paie directement sur la plateforme.

La confirmation arrive automatiquement via l'API du fournisseur mobile money (statut_mobile_money = confirme, reference_mobile_money renseignée).

La demande + l'argent confirmé arrivent chez l'admin.

L'admin paie JIRAMA manuellement via le TPE, saisit le numéro de transaction TPE, valide.

Le reçu est généré et envoyé au compte du client.

Une commission à montant fixe est automatiquement créditée au guichet référent de ce client (commissions), même si le guichet n'a rien fait dans cette transaction.

Flux B — Client paie au guichet, avec l'aide de l'agent

Le guichet enregistre le client (s'il ne l'est pas encore — il devient alors son guichet référent) et saisit les infos du compteur.

Le paiement Orange Money/Mvola est initié par le client lui-même, depuis son propre téléphone, pendant qu'il est physiquement au guichet — l'agent l'assiste mais n'utilise pas son propre compte mobile money.

La confirmation arrive automatiquement via l'API du fournisseur (statut_mobile_money = confirme).

L'admin reçoit infos + argent confirmé, paie JIRAMA via le TPE, saisit et valide.

Le reçu est envoyé au compte du client. Le guichet, en tant que référent, voit aussi la transaction dans son propre tableau de bord.

Commission à montant fixe créditée au guichet référent.

Ce flux est donc très proche du flux A — la seule différence est le lieu physique (au guichet plutôt qu'à distance) et le fait que l'agent assiste le client pour saisir les informations du compteur.

Flux C — Rappels

Chaque mois, la plateforme identifie les clients sans paiement enregistré pour le mois courant.

Vue admin : tous les clients, tous guichets confondus. Vue guichet : uniquement ses propres clients référés.

5. Règle de rattachement client ↔ guichet

Décidé : le rattachement est fixé au moment de l'inscription du client (le guichet qui l'enregistre en premier devient son guichet référent de façon durable). Un changement n'est possible que par une intervention manuelle de l'admin, en cas de litige — ni le client ni le guichet ne peuvent le modifier eux-mêmes.

Techniquement, ça reste un seul champ (clients.guichet_referent_id), modifiable uniquement via une action réservée au rôle admin dans l'interface.

6. Intégration Orange Money / Mvola

Utiliser les API officielles de chaque opérateur pour initier et confirmer le paiement (webhook ou polling de statut selon ce que l'API propose).

Le paiement JIRAMA (sortant, via TPE) reste totalement séparé et manuel : l'API mobile money ne fait que confirmer que l'argent est bien arrivé sur le compte de la plateforme.

Prévoir la gestion des échecs et des délais : un paiement mobile money peut rester "en_attente" un moment avant confirmation.

7. Tableaux de bord

Admin : file d'attente des paiements confirmés à traiter côté JIRAMA, saisie/validation TPE, vue sur toutes les commissions et tous les guichets.

Guichet : ses propres clients, ses demandes de paiement envoyées à l'admin, son solde de commission.

Client : ses factures, son historique, ses reçus.

8. Sécurité et accès

Authentification requise pour les trois rôles.

Un guichet ne voit que ses propres clients et son propre solde de commission (contrôle d'accès appliqué côté backend Laravel).

Seul l'admin valide les transactions TPE et voit l'ensemble de la plateforme.

Une fois un paiement JIRAMA validé, l'enregistrement devient en lecture seule.

9. Spécification fonctionnelle initiale

Application web SaaS de paiement de factures JIRAMA avec trois rôles :
client, guichet, admin.

- Les clients ont un compte, entrent eux-mêmes leurs informations (numéro de
  compteur JIRAMA, mois facturé, montant) et paient via Orange Money ou Mvola.
- Les guichets peuvent enregistrer des clients pour leur compte et saisir les
  informations de compteur pour eux ; le paiement Orange Money/Mvola est ensuite
  fait par le client lui-même depuis son propre téléphone (au guichet ou à
  distance). Chaque client est rattaché de façon définitive, dès son
  inscription, à un guichet référent, qui touche une commission à montant fixe
  sur chaque paiement de ce client, que le paiement soit fait au guichet ou
  directement par le client depuis chez lui. Seul l'admin peut modifier ce
  rattachement, en cas de litige.
- Les admins reçoivent les demandes de paiement confirmées (via l'API Orange
  Money/Mvola), paient JIRAMA manuellement via un TPE physique externe non
  connecté à l'app, saisissent le numéro de transaction du reçu papier du TPE,
  et valident. La validation déclenche l'envoi automatique d'un reçu
  électronique au compte du client ou du guichet, et le versement de la
  commission au guichet référent.

Tables principales : guichets, utilisateurs (guichet/admin), clients (avec
guichet_referent_id), factures, paiements (flux entrant mobile money),
paiements_jirama (flux sortant TPE), commissions, recus.

Authentification et persistance assurées par le backend Laravel dédié
(`/var/www/jiropay/backend/`), avec des règles d'accès pour qu'un guichet ne
voie que ses propres clients et son solde de commission. Prévoit
l'intégration des API Orange Money et Mvola pour la confirmation automatique
des paiements entrants.

Prévoit un tableau de bord différent par rôle, une liste de "rappels" (clients
sans paiement ce mois-ci), et un reçu consultable après chaque paiement validé.

10. Identité visuelle

Couleur de référence : orange, en cohérence avec l'identité JIRAMA. À décliner en une vraie palette avant de construire l'interface (un orange seul ne suffit pas pour une app à trois rôles) : un orange principal pour les actions et les accents, une ou deux teintes neutres pour le fond et le texte, une couleur de succès et une couleur d'alerte distinctes de l'orange pour ne pas les confondre avec les boutons d'action. Je peux préparer cette palette et des maquettes d'écran si besoin, une fois que vous voulez passer à cette étape.

Point encore à trancher

Faut-il un montant de commission unique pour tous les guichets, ou différent selon le guichet ? Le champ montant_commission est déjà enregistré par paiement dans la table commissions, donc les deux options restent possibles sans changer la structure — à décider seulement au moment de configurer les guichets.

## Développement

Voir `/var/www/jiropay/scripts/` sur le serveur — architecture zero-downtime
(releases + symlink + Docker Compose), même schéma que pixel-rise/k-asa,
entièrement isolée (réseau Docker, MySQL, Redis et containers dédiés).

```bash
# Frontend
cd frontend && bun install && bun run dev

# Backend
cd backend && composer install && php artisan serve
```

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
