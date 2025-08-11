# OVP – Portainer Stack Deployment

Diese Anleitung ermöglicht das Starten der OVP-Stacks direkt über Portainer als Stack aus diesem GitHub-Repository – ohne lokale Builds oder weitere Konfiguration.

Hinweis: Portainer baut die Images direkt aus diesem Repository anhand der docker-compose.yml, es ist keine Registry erforderlich.

Wichtig: Die Services publishen keine Ports. Der Zugriff erfolgt über den Nginx Proxy Manager (NPM) im gemeinsamen Docker-Netzwerk.

## URLs und Default-Zugangsdaten
- Öffentliche URL: über deine Domain via NPM (siehe unten)
- API-Health (über Web-Container-Proxy): https://deine-domain.tld/api/health sollte {"ok":true} liefern
- Login: Benutzername `username`, Passwort `password`

## Portainer – Stack aus GitHub starten
1. In Portainer: Stacks → Add stack
2. Build method: Repository
3. Repository Einstellungen:
   - Repository URL: https://github.com/ladisch-business/ovp.git
   - Repository reference: refs/heads/main
   - Compose path: docker-compose.yml
4. Environment variables (optional):
   - PROXY_NETWORK: Name des externen Docker-Netzwerks, in dem dein Nginx Proxy Manager läuft (Default: `proxy`)
   - OVP_DATA_DIR: Pfad für persistente Daten (Default: `/srv/docker/ovp`)
5. Vor Deploy sicherstellen, dass das externe Netzwerk existiert:
   - In Docker: `docker network create proxy` (falls du den Default-Namen nutzt)
   - Oder in Portainer: Networks → Add network → Name = PROXY_NETWORK
6. Deploy the stack

## Nginx Proxy Manager – Einstellungen
Erzeuge einen Proxy Host:
- Domain Names: deine Domain (z. B. ovp.deine-domain.tld)
- Scheme: http
- Forward Hostname / IP: web
- Forward Port: 80
- Websockets: aktiviert
- Block Common Exploits: aktiviert
- SSL: Request a new certificate (Let’s Encrypt), Force SSL, HTTP/2 aktivieren

Voraussetzung: NPM-Container und dieser Stack teilen dasselbe Docker-Netzwerk (PROXY_NETWORK). Falls dein NPM in einem Netzwerk mit anderem Namen läuft, setze PROXY_NETWORK entsprechend beim Stack-Deploy.

## Volumes (persistente Daten)
- Persistente Daten (JSON/Uploads): Standardpfad `/srv/docker/ovp` wird in den API-Container gemountet:
  - Host: `${OVP_DATA_DIR:-/srv/docker/ovp}`
  - Container: `${OVP_DATA_DIR:-/srv/docker/ovp}`

## Umgebungsvariablen (Optional)
Alle Variablen sind bereits mit sinnvollen Defaults gesetzt:
- AUTH_USER=username
- AUTH_PASS=password
- OVP_DATA_DIR=/srv/docker/ovp
- VITE_API_BASE=/api
- API_CORS_ORIGIN=http://localhost:5173
- PROXY_NETWORK=proxy

## Lokale Entwicklung (optional)
- Lokales Compose (mit Build): `docker compose up -d` (lokal ggf. Ports hinzufügen)
- CI ist grün; Tests/Lint/Build laufen in GitHub Actions.

Viel Erfolg beim Deploy!
# OVP

Dieses Repository enthält die Implementierung der selbstgehostelten Videoplattform gemäß lastenheft.md.
## Entwicklung

1) .env anlegen (siehe `.env.example`)
2) Abhängigkeiten installieren:
   - Backend: `cd api && npm install`
   - Frontend: `cd web && npm install`
3) Lokal starten:
   - API: `npm run dev` in `api/` (Port 8080)
   - WEB: `npm run dev` in `web/` (Port 5173)
4) Docker (optional): `docker compose up -d`

Standard-Zugang (nur Entwicklung):
Benutzername: `username`
Passwort: `password`
