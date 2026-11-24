# Astro Go GO 🔭

Un "go / no-go" pour observer le ciel : à partir d'un lieu et d'une date,
l'app calcule un score sur 100 (nuages, Lune, planètes visibles).

## Architecture

Front → Gateway → score-service → ephemeris-service
↓
spots-service → PostgreSQL

## Services
- `ephemeris-service` : positions des planètes, phase de la Lune

## Image Docker

```bash
docker build -t shxru/astrogo-ephemeris:1.0 ./ephemeris-service
docker push shxru/astrogo-ephemeris:1.0
```

## Lancer sur Minikube

```bash
minikube start --driver=docker
kubectl apply -f k8s/ephemeris/
kubectl get pods
kubectl port-forward svc/ephemeris-service 8080:80
curl "http://localhost:8080/moon?lat=48.85&lon=2.35"
```

## Gateway (Ingress)

```bash
minikube addons enable ingress
kubectl apply -f k8s/gateway/
minikube tunnel
curl "http://127.0.0.1/api/ephemeris/moon?lat=48.85&lon=2.35"
```