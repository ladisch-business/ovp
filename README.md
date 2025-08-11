# OVP – Portainer Stack Deployment

Diese Anleitung ermöglicht das Starten der OVP-Stacks direkt über Portainer als Stack aus diesem GitHub-Repository – ohne lokale Builds oder weitere Konfiguration.

Hinweis: Portainer baut die Images direkt aus diesem Repository anhand der docker-compose.yml, es ist keine Registry erforderlich.

## URLs und Default-Zugangsdaten
- Web-UI: http://<SERVER-IP>:5173
- API-Health: http://<SERVER-IP>:5173/api/health
- Login: Benutzername `username`, Passwort `password`

Diese Defaults sind im Portainer-Stack vorkonfiguriert. Sie können später in Portainer via Umgebungsvariablen überschrieben werden, falls gewünscht.

## Portainer – Stack aus GitHub starten
1. In Portainer: Stacks → Add stack
2. Option "Web editor" wählen.
3. Komponieren Sie via Repository-URL:
   - Repository URL: https://github.com/ladisch-business/ovp.git
   - Repository reference: refs/heads/main
   - Compose path: docker-compose.yml
4. Optional: Nichts ändern – die Defaults funktionieren out-of-the-box.
5. "Deploy the stack" klicken.

Alternativ per Raw-URL:
- Öffnen Sie die Raw-Ansicht der Datei `docker-compose.yml` im Browser und kopieren Sie den Inhalt in den Portainer-Editor.

## Deployment über Repository (Build in Portainer)
Portainer baut die Images direkt aus diesem Repository anhand der `docker-compose.yml` (mit `build:` Sektionen). Es ist keine zusätzliche Konfiguration nötig und keine Registry erforderlich. Einfach den Stack wie oben beschrieben anlegen und „Deploy the stack“ klicken.

## Ports und Volumes
- Web: Port 5173 → Containerport 80
- API: Port 8080 → Containerport 8080
- Persistente Daten (JSON/Uploads): Standardpfad `/srv/docker/ovp` wird als Volume gemountet:
  - Host: `${OVP_DATA_DIR:-/srv/docker/ovp}`
  - Container: `${OVP_DATA_DIR:-/srv/docker/ovp}`

## Umgebungsvariablen (Optional)
Alle Variablen sind bereits mit sinnvollen Defaults gesetzt:
- AUTH_USER=username
- AUTH_PASS=password
- PORT_API=8080
- PORT_WEB=5173
- OVP_DATA_DIR=/srv/docker/ovp
- VITE_API_BASE=/api
- API_CORS_ORIGIN=http://localhost:5173

Sie können diese Werte bei Bedarf in Portainer anpassen (Stack-Umgebungsvariablen).

## Lokale Entwicklung (optional)
- Lokales Compose (mit Build): `docker compose up -d`
- CI ist grün; Tests/Lint/Build laufen in GitHub Actions.

Viel Erfolg beim Deploy!
# OVP

Dieses Repository enthält die Implementierung der selbstgehosteten Videoplattform gemäß lastenheft.md.
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
