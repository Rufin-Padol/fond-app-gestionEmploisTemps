# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application pour la production
RUN npm run build

# Étape de production avec nginx
FROM nginx:alpine

# Supprimer la configuration nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Copier les fichiers buildés depuis l'étape précédente
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
