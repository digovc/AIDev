#!/bin/bash

# Script de build do AIDev

# Instala dependências do Backend
cd backend
npm install

# Instala dependências do Frontend
cd ..
cd frontend
npm install
npm run build
