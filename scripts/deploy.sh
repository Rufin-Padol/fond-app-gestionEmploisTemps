#!/bin/bash

# Script de déploiement manuel pour le VPS
set -e

echo "🚀 Déploiement de l'application Angular..."

# Variables
CONTAINER_NAME="angular-app"
IMAGE_NAME="angular-app:latest"
PORT="3000"

# Arrêter et supprimer l'ancien container
echo "📦 Arrêt de l'ancien container..."
docker stop $CONTAINER_NAME 2>/dev/null || echo "Aucun container à arrêter"
docker rm $CONTAINER_NAME 2>/dev/null || echo "Aucun container à supprimer"

# Nettoyer les anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

# Build de la nouvelle image
echo "🔨 Build de la nouvelle image..."
docker build -t $IMAGE_NAME .

# Démarrer le nouveau container
echo "🎯 Démarrage du nouveau container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:80 \
  --restart unless-stopped \
  $IMAGE_NAME

echo "✅ Déploiement terminé! Application disponible sur le port $PORT"

# Afficher les logs
echo "📋 Logs du container:"
docker logs $CONTAINER_NAME --tail 20