# AMAC Bingerville — Application de Réservation

Application web de réservation de PASS et de pré-commande de menu pour la **Fête combinée des Mères & des Pères** organisée par la Section Café Coton de l'AMAC Bingerville.

**Date** : Jeudi 18 juin 2026 — 18H00  
**Lieu** : Rooftop du Capitol Hôtel, Riviera Golf (face Mosquée Albayane), Abidjan

---

## Stack technique

- **Next.js 15** (App Router, TypeScript strict)
- **Tailwind CSS v4** (design system custom, thème rooftop noir/or)
- **SQLite** via `better-sqlite3` + **Drizzle ORM**
- Zéro authentification pour les invités (code AMAC-XXXX + téléphone)
- QR Code généré côté client (`qrcode`)
- PIN admin simple (variable d'env `ADMIN_PIN`)

---

## Installation (Windows PowerShell)

```powershell
# 1. Aller dans le dossier
cd amac-reservation

# 2. Installer les dépendances
pnpm install

# 3. Copier et configurer les variables d'environnement
Copy-Item .env.example .env.local
# Éditez .env.local pour changer le PIN admin (défaut : 2026)

# 4. Créer la base de données et injecter les données
pnpm db:seed

# 5. Lancer le serveur de développement (port 3001)
pnpm dev
```

L'application est disponible sur [http://localhost:3001](http://localhost:3001).

---

## Variables d'environnement (.env.local)

| Variable | Description | Défaut |
|---|---|---|
| `ADMIN_PIN` | Code PIN pour accéder à `/admin` | `2026` |

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page — présentation de l'événement et des Pass |
| `/reserver` | Tunnel de réservation 4 étapes (Pass → Menu → Coordonnées → Confirmation) |
| `/menu` | Carte complète consultable (lecture seule) |
| `/ma-reservation` | Retrouver sa réservation via code `AMAC-XXXX` ou téléphone |
| `/admin` | Tableau de bord protégé par PIN |

## API Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/passes` | Liste des pass actifs |
| `GET` | `/api/menu` | Catégories + items + variantes |
| `POST` | `/api/reservations` | Créer une réservation |
| `GET` | `/api/reservations/lookup?code=` | Retrouver par code |
| `GET` | `/api/reservations/lookup?tel=` | Retrouver par téléphone |
| `PATCH` | `/api/admin/reservations/[id]` | Mettre à jour le statut (header `x-admin-pin`) |
| `GET` | `/api/admin/stats` | Statistiques admin |

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx              ← Landing
│   ├── reserver/page.tsx     ← Tunnel réservation (4 étapes)
│   ├── menu/page.tsx         ← Carte consultable
│   ├── ma-reservation/       ← Lookup réservation
│   ├── admin/page.tsx        ← Dashboard admin PIN
│   ├── globals.css           ← Design system (thème AMAC)
│   ├── layout.tsx            ← Layout racine
│   └── api/                  ← API Routes Next.js
├── components/
│   ├── Stepper.tsx           ← Indicateur d'étapes
│   ├── PassCard.tsx          ← Carte pass avec stepper quantité
│   ├── CartSummary.tsx       ← Récapitulatif + jauge crédit
│   └── QRCodeDisplay.tsx     ← Canvas QR Code
├── lib/
│   ├── db.ts                 ← Connexion SQLite/Drizzle (TODO Turso)
│   ├── schema.ts             ← Schéma Drizzle
│   ├── relations.ts          ← Relations Drizzle
│   ├── types.ts              ← Types TypeScript partagés
│   └── utils.ts              ← Formatters, générateur de code, calcul 2+1
data/
└── amac.db                   ← Base SQLite (créée par pnpm db:seed)
scripts/
└── seed.ts                   ← Script de seeding
drizzle.config.ts
```

---

## Migration SQLite → Turso (déploiement Vercel)

L'app utilise déjà `@libsql/client` + Drizzle. En local, la base est `data/amac.db`.  
En production (Vercel), configurez Turso :

### 1. Installer la CLI Turso (Windows PowerShell)

```powershell
irm https://github.com/tursodatabase/turso/releases/latest/download/turso_cli-installer.ps1 | iex
turso auth login
```

### 2. Créer la base

```powershell
# Script guidé
.\scripts\turso-setup.ps1

# Ou manuellement
turso db create amac-reservation
turso db show amac-reservation --url
turso db tokens create amac-reservation
```

### 3. Configurer `.env`

```env
TURSO_DATABASE_URL=libsql://amac-reservation-<org>.turso.io
TURSO_AUTH_TOKEN=eyJhbG...
ADMIN_PIN=2026
```

### 4. Schéma + données initiales

```powershell
pnpm db:push:turso   # crée les tables sur Turso
pnpm db:seed:turso   # pass, menu, catégories
```

Sans `TURSO_*` dans `.env`, l'app continue d'utiliser SQLite local automatiquement.

---

## Logique métier

### Formule 2+1 (Pass)
Pour chaque tranche de 3 pass identiques commandés, 1 est offert.  
Calculé côté **serveur** uniquement — le client n'est pas fiable pour les totaux.

### Offre BOCK 2+1
Même logique pour la Bière Bock (item partenaire Solibra) : 3 → 2 payés.

### Code AMAC-XXXX
Généré côté serveur avec des caractères sans ambiguïté (O/0 et I/1 exclus).  
Collision vérifiée en base avant insertion (10 tentatives max).

### PIN Admin
Le header `x-admin-pin` est vérifié sur chaque route `/api/admin/*`.  
Simple protection contre l'accès accidentel — pas un système d'auth renforcé.

---

*AMAC Bingerville — Section Café Coton © 2026*
