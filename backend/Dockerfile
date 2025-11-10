# Image de base Node.js LTS (Alpine = léger)
FROM node:20-alpine

# Installer les dépendances système nécessaires
# better-sqlite3 a besoin de python et build-base
RUN apk add --no-cache python3 make g++

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances (production seulement)
RUN npm ci --only=production

# Copier le reste du code
COPY . .

# Créer le dossier uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port 5000
EXPOSE 5000

# Variables d'environnement par défaut (surchargées par docker-compose)
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["node", "server.js"]