#!/bin/bash
cd root/PaarshEdu/Paarsh

echo "🚀 Pulling latest code..."
git reset --hard origin/main  # Replace 'main' with your branch name
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "⚙️ Building project..."
npm run build

echo "🔄 Restarting server..."
pm2 restart paarshedu  # If using PM2

echo "✅ Deployment complete!"
