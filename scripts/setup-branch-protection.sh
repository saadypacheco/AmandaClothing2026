#!/usr/bin/env bash
# setup-branch-protection.sh
# Configura protección de ramas en GitHub vía gh CLI
# Requisito: gh auth login previo

set -e

REPO="saadypacheco/AmandaClothing2026"

echo "Configurando protección de rama: main"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/main/protection" \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Frontend — Build & Lint",
      "Backend — Lint & Tests"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

echo "Configurando protección de rama: develop"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/develop/protection" \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Frontend — Build & Lint",
      "Backend — Lint & Tests"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

echo "Proteccion de ramas configurada correctamente"
