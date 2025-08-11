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
