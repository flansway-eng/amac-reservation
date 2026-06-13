# Création d'une base Turso pour AMAC Reservation (Windows PowerShell)
# Prérequis : Turso CLI installé + compte connecté
#
# Installation CLI (une fois) :
#   irm https://github.com/tursodatabase/turso/releases/latest/download/turso_cli-installer.ps1 | iex
#
# Connexion (ouvre le navigateur) :
#   turso auth login

$DbName = "amac-reservation"

Write-Host "=== Turso : création de la base '$DbName' ===" -ForegroundColor Cyan

# 1. Créer la base
turso db create $DbName
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 2. Afficher l'URL
Write-Host "`nURL de la base :" -ForegroundColor Yellow
turso db show $DbName --url

# 3. Créer un token d'accès (lecture/écriture)
Write-Host "`nToken d'accès (à copier dans .env) :" -ForegroundColor Yellow
turso db tokens create $DbName

Write-Host @"

=== Prochaines étapes ===

1. Créez un fichier .env à la racine du projet avec :

   TURSO_DATABASE_URL=<url affichée ci-dessus>
   TURSO_AUTH_TOKEN=<token affiché ci-dessus>
   ADMIN_PIN=2026

2. Poussez le schéma Drizzle :
   pnpm db:push:turso

3. Injectez les données initiales (pass, menu) :
   pnpm db:seed:turso

"@ -ForegroundColor Green
