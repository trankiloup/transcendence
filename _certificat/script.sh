#!/bin/bash

openssl req -x509 -newkey rsa:4096 -keyout transcendence.key -out transcendence.crt \
    -days 365 -nodes \
    -subj "/C=FR/ST=NouvelleAquitaine/L=Angouleme/O=42/OU=42student/CN=transcendence.42.fr/UID=transcendence"


mkdir -p ./backend/certificat
mkdir -p ./frontend/certificat

cp transcendence.key ./backend/certificat
cp transcendence.crt ./backend/certificat
cp transcendence.key ./frontend/certificat
cp transcendence.crt ./frontend/certificat

mkdir -p ./SharedImages
sudo cp ./frontend/src/assets/default-avatar.png ./SharedImages