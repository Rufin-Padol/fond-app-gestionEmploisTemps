FROM nginx:alpine

# Supprimer les configs nginx par défaut
RUN rm -rf /etc/nginx/conf.d/*

# Copier ta config nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers déjà buildés (le dossier dist uploadé par GitHub Actions)
COPY dist/ /usr/share/nginx/html/

# Fixer les permissions
RUN chmod -R 755 /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer nginx au démarrage du container
CMD ["nginx", "-g", "daemon off;"]
