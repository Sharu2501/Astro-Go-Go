# Astro Go GO 🔭

Un "go / no-go" pour observer le ciel : à partir d'un lieu et d'une date,
l'app calcule un score sur 100 (nuages, Lune, planètes visibles).

## Architecture

Front → Gateway → score-service → ephemeris-service
↓
spots-service → PostgreSQL

## Services
- `ephemeris-service` : positions des planètes, phase de la Lune