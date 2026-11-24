# Astro Go Go 🔭

Un "go / no-go" pour observer le ciel : à partir d'un lieu et d'une date,
l'app calcule un score sur 100 (nuages, Lune, planètes visibles).

## Architecture

```
Client → Gateway (Ingress NGINX) ─┬─ /api/ephemeris → ephemeris-service
                                  └─ /api/score     → score-service ─┬→ ephemeris-service
                                                                     └→ Open-Meteo (météo)

(après) spots-service → PostgreSQL
```

## Services

- `ephemeris-service` : positions des planètes, phase de la Lune
- `score-service` : score d'observation sur 100 (nuages 50 %, Lune 25 %, planètes 25 %, 0 s'il fait jour)

## Images Docker

```bash
docker build -t shxru/astrogo-ephemeris:1.0 ./ephemeris-service
docker push shxru/astrogo-ephemeris:1.0

docker build -t shxru/astrogo-score:1.1 ./score-service
docker push shxru/astrogo-score:1.1
```

## Lancer sur Minikube

```bash
minikube start --driver=docker
minikube addons enable ingress
kubectl apply -f k8s/ephemeris/
kubectl apply -f k8s/score/
kubectl apply -f k8s/gateway/
kubectl get pods
minikube tunnel
```

## Exemples

```bash
curl "http://127.0.0.1/api/ephemeris/moon?lat=48.85&lon=2.35"
curl "http://127.0.0.1/api/ephemeris/planets?lat=48.85&lon=2.35"
curl "http://127.0.0.1/api/score?lat=48.85&lon=2.35"
```