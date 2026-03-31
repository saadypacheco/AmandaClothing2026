# ci-cd.md

## CI/CD con GitHub Actions

### Flujo
1. Push a main → ejecuta tests
2. Build Docker backend
3. Push a ACR (Azure Container Registry)
4. Deploy a Railway (backend)
5. Deploy a Vercel (frontend)

### Variables secretas
- DOCKER_REGISTRY_URL
- DOCKER_USERNAME
- DOCKER_PASSWORD
- RAILWAY_TOKEN
- VERCEL_TOKEN

### Tests
Backend: `pytest`
Frontend: `npm run test` (si aplica)
