# Guide de déploiement Angular autonome

## Configuration GitHub Actions

Ajoutez ces secrets dans votre repository GitHub (Settings > Secrets and variables > Actions):

- `VPS_HOST`: Adresse IP de votre VPS
- `VPS_USERNAME`: Nom d'utilisateur SSH  
- `VPS_SSH_KEY`: Clé privée SSH (contenu complet)

## Configuration nginx

Dans le fichier `nginx.conf`, remplacez :
```
proxy_pass http://VOTRE_IP_VPS:PORT_SPRING_BOOT/api/;
```

Par l'URL de votre API Spring Boot, par exemple :
```
proxy_pass http://192.168.1.100:8080/api/;
```

## Déploiement

### Automatique (GitHub Actions)
- Push sur la branche `main` déclenche automatiquement le déploiement

### Manuel
```bash
# Sur votre VPS
cd /home/deploy/angular-app
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## URLs d'accès

- **Application Angular**: `http://votre-vps:3000`
- **API calls**: Les appels `/api/*` sont proxifiés vers votre Spring Boot

## Monitoring

```bash
# Voir les logs
docker logs angular-app -f

# Vérifier le statut
docker ps | grep angular-app

# Redémarrer si nécessaire
docker restart angular-app
```

## Configuration Angular pour l'API

Dans votre code Angular, utilisez des URLs relatives :
```typescript
// ✅ Correct
this.http.get('/api/users')

// ❌ Évitez les URLs absolues
this.http.get('http://localhost:8080/api/users')
```