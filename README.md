# JiroPay

Plateforme SaaS de paiement de factures JIRAMA (Orange Money / Mvola), avec
réseau de guichets partenaires et commissions. Voir `frontend/README.md` pour
la spécification fonctionnelle complète.

Projet indépendant — aucune ressource (base de données, cache, réseau Docker,
domaine) partagée avec pixel-rise, pixelrise-booking, pico.doc ou k-asa.

## Structure

```
jiropay/
├── frontend/   → TanStack Start + React + TypeScript (SSR, build "node-server")
└── backend/    → API Laravel
```

## Démarrage rapide (local)

```bash
# Frontend
cd frontend && bun install && bun run dev

# Backend
cd backend && composer install && php artisan serve
```

## Déploiement (production)

Voir `/var/www/jiropay/scripts/` sur le serveur — architecture zero-downtime
(releases + symlink + Docker Compose), même schéma que pixel-rise/pico.doc/k-asa
mais entièrement isolée : réseau Docker, MySQL, Redis et containers dédiés.

```bash
./scripts/deploy.sh              # build + release + healthcheck
./scripts/switch.sh release_xxx  # activer une release testée
./scripts/rollback.sh            # revenir à la précédente
```

## État du projet (2026-08-10)

Phase 1 — infrastructure seulement : squelette Laravel minimal (Sanctum,
Redis, MySQL, `/up`, CORS), aucune table métier. Frontend nettoyé de tout
Lovable/Supabase, espace authentifié en placeholder "en construction". La
logique métier (guichets, clients, factures, paiements, commissions, reçus —
voir `frontend/README.md`) sera portée dans une session dédiée.

Sous-domaine temporaire `jiropay.pixel-rise.com` en attendant un nom de
domaine propre à JiroPay.
