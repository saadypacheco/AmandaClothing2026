#!/usr/bin/env bash
# release.sh — Crear un release SemVer
# Uso: ./scripts/release.sh patch|minor|major
#
# patch → 1.0.0 → 1.0.1  (bug fixes)
# minor → 1.0.0 → 1.1.0  (nuevas features, sin breaking changes)
# major → 1.0.0 → 2.0.0  (breaking changes)

set -e

TYPE=${1:-patch}

if [[ ! "$TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Error: tipo debe ser patch, minor o major"
  exit 1
fi

# Asegurarse de estar en main y actualizado
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "Error: debés estar en la rama main para crear un release"
  exit 1
fi

git pull origin main

# Obtener el último tag o usar 0.0.0
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
VERSION=${LAST_TAG#v}  # quitar el "v" del inicio

IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

case $TYPE in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"

echo "Creando release: $LAST_TAG → $NEW_VERSION"

# Crear y pushear el tag
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
git push origin "$NEW_VERSION"

echo "✓ Tag $NEW_VERSION pusheado — GitHub Actions creará el release automáticamente"
