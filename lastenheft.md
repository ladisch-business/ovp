# Lastenheft – Video-Plattform im Netflix-Stil (Dark Theme)

> Datei: `lastenheft.md`  
> Zweck: Vorgaben für Entwicklung, Tests, CI/CD und Deployment. Übergabefähig an Devin.ai.

---

## 1. Projektbeschreibung
Selbstgehostete Videoplattform im **Netflix-Look**. Upload sehr großer Dateien, Kategorisierung & Tags, Favoriten, Suche, Bearbeiten/Löschen. **Ohne Datenbank** – persistente JSON-Dateien. Deployment via **Docker/Portainer**.  
**Blocker:** Bevor ein Branch/PR im GitHub-Repo erstellt wird, müssen **umfangreiche Tests** (Unit, Integration, E2E, Performance, Security) in CI **grün** sein.

---

## 2. Funktionale Anforderungen

### 2.1 Videoverwaltung
- **Upload unbegrenzter Größe** (Chunked Upload + resumable), Pflichtfelder:
  - Videodatei (z. B. `.mp4`)
  - `preview.jpg`
  - `cover.jpg`
  - **Titel**
  - **Kategorie** (nur aus Bestand)
  - **Tags** (nur aus Bestand, mehrere möglich)
- **Ordnerstruktur pro Video:**
  ```
  /upload/{videoId}/
    video.mp4
    preview.jpg
    cover.jpg
    meta.json (optional)
  ```
- **Zwei Progressbars:**
  - **Client → Backend** (Uploadfortschritt, Chunks)
  - **Backend → Storage** (serverseitiges Schreiben/Verarbeiten)
- **Bearbeiten:** Titel, Kategorie, Tags; Preview/Cover austauschbar.
- **Löschen:** rekursiv (Dateien + Ordner), danach UI-Eintrag entfernen.

### 2.2 Kategorien & Tags
- Verwaltung **nicht** beim Upload.
- **Settings-Seite** für Kategorien & zugehörige Tags (Anlegen, Umbenennen, Löschen).
- Tags sind **immer** einer Kategorie zugeordnet.
- Upload nutzt **nur bestehende** Kategorien/Tags (per Auswahl).

### 2.3 Sidebar (Navigation/Filter)
- Anzeige **aller Kategorien** mit **zugehörigen Tags** (Gruppierung).
  - Klick **Kategorie** → Filter auf alle Videos der Kategorie.
  - Klick **Tag** → Filter auf Videos mit diesem Tag.

### 2.4 Suche & Filter
- **Live-Suche (Autosuggest)** mit Modus:
  - **Titel**
  - **Tags**
  - **Titel + Tags** (kombiniert)
- Ergebnisse in Echtzeit, Tastatur-Navigation.

### 2.5 Favoriten
- Toggle „Favorit“ pro Video.
- **Favoriten-Seite** (alle markierten Videos).

### 2.6 Speicheranzeige
- Anzeige freier/belegter Speicher des Hostsystems im UI.

---

## 3. Nicht-funktionale Anforderungen
- Stabil bei sehr großen Dateien (Chunk-Größe konfigurierbar, Wiederaufnahme).
- Robuste Fehlerbehandlung (Abbrüche, fehlerhafte Chunks, Berechtigungen).
- **Sichere Authentifizierung** via `.env`.
- Saubere Logs, klare API-Fehlermeldungen (maschinenlesbar).
- Hohe Testabdeckung, deterministische Tests.

---

## 4. Design / UX

### 4.1 Netflix-Anmutung (Dark)
- **Dark Theme** (nahe Schwarz, dezente Kontraste).
- Startseite: **Cover-Grid** mit Hover-Effekt (Preview-Thumb erlaubt).
- Große Cover-Kacheln, leichte Rundungen, sanfte Transitions.
- Typografie: prominente Titel, dezente Metadaten.
- Responsiv für Desktop/Tablet/Mobile.

### 4.2 Login – strikt minimal
- **Ausschließlich** Formular mit Username/Password.
- **Keine** Logos, Texte, Bilder, Links, Footer, Hinweise – **nur** Formular + notwendige Fehlermeldung im Feld.
- Serverseitig Rate-Limit/Lockout; CSRF-Schutz.

---

## 5. Technik

### 5.1 Benutzerverwaltung (ENV-basiert)
- **Ein** Benutzer aus `.env`:
  ```
  AUTH_USER=...
  AUTH_PASS=...
  ```
- Auth via HTTP-Only, Secure Cookies **oder** kurzlebige JWT + Refresh.
- CSRF-Token, SameSite-Einstellungen.

### 5.2 Datenhaltung (ohne DB)
- `videos.json` – Videometadaten (pfadsicher).
- `categories.json` – Kategorien & zugehörige Tags.
- **Atomare Updates** (Tempfile+Rename), Locking, Validierung via JSON-Schema.

### 5.3 Backend (API)
- Endpunkte:
  - `POST /api/auth/login`, `POST /api/auth/logout`
  - `GET /api/videos` (Liste, Filter, Suche)
  - `POST /api/videos` (Upload + Metadaten anlegen)
  - `PUT /api/videos/:id` (Bearbeiten)
  - `DELETE /api/videos/:id` (rekursiv löschen)
  - `POST /api/videos/:id/favorite` (toggle)
  - `GET /api/storage` (Speicherinfo)
  - `GET|POST|PUT|DELETE /api/settings/categories` (CRUD für Kategorien/Tags)
  - `GET /api/upload/status/:token` (serverseitiger Fortschritt)
- Upload: Chunked, Prüfsummen/ETags, MIME-Check, Limits pro Chunk, Pfad-Sanitizing.
- Sicherheit: Input-Validation, CORS restriktiv, Logging (ohne sensible Daten).

### 5.4 Frontend
- Empfohlen: **React + Vite** (oder Next.js).
- Seiten: **Login**, **Home (Grid)**, **Favoriten**, **Upload**, **Settings**, optional **Detail**.
- Sidebar (Kategorien/Tags), Live-Suche, **2 Progressbars** im Upload-Dialog.
- State: Client-Store (z. B. Zustand/Redux) + SWR/React-Query.
- Kein Marketing-Content – funktionaler Admin-Charakter.

---

## 6. Qualitätssicherung & Tests (Blocker vor Branch/PR)

### 6.1 Testarten (Pflicht)
- **Unit (FE/BE):** Komponenten, Utils, Services.
- **Integration (API):** vollständige Flows ohne UI (z. B. Supertest).
- **E2E (UI):** Playwright/Cypress – Login, Upload (Dummy-Dateien/Chunks), Suche, Filter, Favoriten, Settings (CRUD), rekursives Löschen, Bearbeiten, Speicheranzeige.
- **Performance/Load:** parallele große Uploads (synthetisch), definierte Zielwerte.
- **Security:** Auth-Flows, CSRF, Rate-Limit, Directory-Traversal, MIME-Spoofing, unautorisierter Zugriff.
- **Accessibility (Basis):** Fokus, ARIA für Kernkomponenten.
- **Visual/Snapshot:** Cards, Sidebar, Login-Form.

### 6.2 Abdeckung & Gates
- Coverage-Schwellen: **≥ 85 % Lines/Branches** für Frontend **und** Backend.
- Lint/Format (**ESLint/Prettier**) → **blocking**.
- Typecheck (**TS strict**) → **blocking**.
- E2E-Suite **grün** in CI (Headless).

### 6.3 CI/CD (GitHub Actions)
- Jobs (in Reihenfolge, alle **blocking**):
  1. `lint` (ESLint/Prettier-Check)
  2. `typecheck` (`tsc --noEmit`)
  3. `unit_and_integration` (Node LTS)
  4. `e2e` (Headless, Test-Server im CI)
  5. `build` (FE/BE, Docker-Image build)
  6. `security` (`npm audit`, Container-Scan z. B. trivy)
- Branch wird **nur erstellt**, wenn alle Jobs grün sind; sonst Fail mit Protokollen.

### 6.4 Branch/PR-Vorgehen (Devin)
- Branch-Name: `feature/netflix-video-app-initial` (Schema `feature/<slug>`).
- Push nur bei **grüner** CI.
- PR mit:
  - Testbericht (Coverage-Report, E2E-Ergebnisse, Performance-Kurzreport)
  - Changelog (funktionale Punkte)
  - Liste offener TODOs (falls vorhanden)

---

## 7. JSON-Beispiele

### 7.1 `videos.json`
```json
[
  {
    "id": "video-uuid",
    "title": "Beispieltitel",
    "category": "Haarfarbe",
    "tags": ["Blond", "Schwarz"],
    "favorite": false,
    "files": {
      "video": "/upload/video-uuid/video.mp4",
      "preview": "/upload/video-uuid/preview.jpg",
      "cover": "/upload/video-uuid/cover.jpg"
    },
    "createdAt": "2025-08-11T10:00:00Z",
    "updatedAt": "2025-08-11T10:00:00Z"
  }
]
```

### 7.2 `categories.json`
```json
[
  { "category": "Haarfarbe", "tags": ["Blond", "Schwarz", "Braun"] },
  { "category": "Genre", "tags": ["Action", "Drama"] }
]
```

---

## 8. Deployment & Infrastruktur

### 8.1 Docker / Compose
- Volume-Pfad: `/srv/docker/{container}`
- Upload-Pfad: `/srv/docker/{container}/upload`
- **Anforderungen an `docker-compose.yml`:**
  - Services: `web` (Frontend), `api` (Backend), optional `proxy`.
  - Volumes gemäß oben, Upload-Ordner gemountet.
  - `.env` eingebunden (Auth, Ports, Pfade).
  - Healthchecks (HTTP) für `web` und `api`.
- Start:
  ```bash
  docker compose up -d
  ```

### 8.2 Portainer
- Stack-Deployment direkt aus `docker-compose.yml`.
- Logs & Healthchecks aktiv, Neustart-Policy `unless-stopped`.

---

## 9. Sicherheit
- Keine Public-Registrierung; **ein** Benutzer via `.env`.
- Login-Seite **nur** Formular (keine Logos/Texte/Bilder).
- HTTPS-Terminierung (Proxy-fähig).
- CORS restriktiv (eigene Origin).
- Rate-Limit auf Login & Upload.
- Validierte Dateitypen, sichere Dateinamen, Pfad-Sanitizing.
- Secrets nicht in Logs.

---

## 10. Abnahmekriterien (Go/No-Go vor Branch/PR)
1. **Loginseite enthält ausschließlich das Formular.**  
2. Upload großer Testdatei (>5 GB simuliert) funktioniert; beide Progressbars korrekt.  
3. Rekursives Löschen entfernt Ordner + Dateien; UI aktualisiert.  
4. Kategorien/Tags ausschließlich über Settings gepflegt; Auswahl im Upload.  
5. Sidebar zeigt Kategorien inkl. Tags (Gruppierung); Filter funktionieren.  
6. Live-Suche: Titel / Tags / kombiniert; Autosuggest live.  
7. Favoriten: Toggle + Favoriten-Seite.  
8. Speicheranzeige liefert korrekte Werte.  
9. **Alle CI-Jobs grün**, Coverage ≥ **85 %** (FE/BE), E2E-Suite grün.  
10. Docker-Start mit `docker compose up -d` auf frischem Host lauffähig.

---

## 11. Hinweise für Implementierung (nicht bindend, aber empfehlenswert)
- Frontend: React + Vite, Zustand/Redux, React-Query/SWR, Tailwind (Dark).  
- Backend: Node.js (Express/Fastify), Multer/Busboy oder eigenständig für Chunks, Zod/JOI für Validation.  
- Tests: Vitest/Jest, Supertest, Playwright/Cypress, NYC/Coverage.  
- JSON-Schema-Validierung vor Persistenz; atomare Writes.  
- Logging: strukturierte Logs (z. B. pino/winston), Log-Rotation.

---
