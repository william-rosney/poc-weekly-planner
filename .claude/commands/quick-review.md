# Quick Review Command

Passe en revue les changements selon la checklist qualité du projet.

## Checklist

### Avant chaque commit

- [ ] TypeScript compile sans erreur (`npm run typecheck`)
- [ ] ESLint passe (`npm run lint`)
- [ ] Prettier formaté (`npm run format:check`)
- [ ] Pas de `console.log` en production
- [ ] Pas de secrets en dur
- [ ] Accessibilité vérifiée (Alt text, ARIA labels)

### À la revue de code

- [ ] Le code suit les conventions du projet (voir CLAUDE.md)
- [ ] La logique est compréhensible
- [ ] Pas de dépendances inutiles ajoutées
- [ ] Documentation à jour (README, JSDoc)
- [ ] Pas de sécurité compromise (injection, CORS, etc.)
