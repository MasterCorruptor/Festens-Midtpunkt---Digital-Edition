# Festens Midtpunkt

Festens Midtpunkt er en selvhostet nettapplikasjon for digitale selskaps- og kortspill. Applikasjonen støtter offisielle og egendefinerte kortstokker, spillere, plassholdere, straffekort og redigering direkte i nettleseren.

Nåværende versjon: **v0.8.0**

## Nåværende funksjonalitet

### Spill

- Registrering og fjerning av spillere.
- Validering av minimum, maksimum og spillerregel før start.
- Tilfeldig stokking av vanlige kort ved spillstart.
- Kortindikatorer for vanlige kort og trukne straffekort.
- Godkjenning av hvert vanlig kort og avvisning når kortstokken har straffekort.
- Ett tilfeldig straffekort for hver avvisning.
- Oppsummering av gjennomgåtte vanlige kort og trukne straffekort.
- Statistikk over spillerne som oftest ble valgt gjennom plassholdere.
- Handlingsanimasjoner, straffekortmarkering og tidsbegrenset konfetti.
- Støtte for brukerens innstilling for redusert bevegelse.
- Restart eller retur til hovedmenyen etter avsluttet spill.

### Kortstokkeditor

- Opprettelse av egendefinerte kortstokker.
- Redigering av offisielle og egendefinerte kortstokker.
- Sletting av egendefinerte kortstokker etter bekreftelse.
- Beskyttelse mot sletting av offisielle kortstokker.
- Bulkimport av vanlige kort og straffekort, én linje per kort.
- Egen kortliste for redigering og fjerning av kort.
- Knapper for innsetting av `{player}`, `{player1}` og `{player2}`.
- Servervalidering av ID, navn, metadata, spillerregler og kortinnhold.
- Synlige feil ved lasting, lagring og sletting.

## Teknologi

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express
- JSON-filer
- Docker og Docker Compose

Det brukes ingen frontend-rammeverk, database eller byggpipeline.

## Lokal kjøring

Installer avhengigheter og start serveren fra `server`-mappen:

```powershell
cd server
npm install
npm start
```

Åpne deretter:

```text
http://localhost:3000
```

Serveren leverer både frontendfilene og API-et.

## Docker

Bygg og start med:

```powershell
docker compose up --build
```

Docker Compose eksponerer applikasjonen på:

```text
http://localhost:27015
```

`server/data` bind-monteres til containeren slik at kortstokkendringer lagres på vertsmaskinen. Se [docs/docker.md](docs/docker.md) for detaljer og kjente begrensninger.

## Lagring

Kortstokker lagres på serveren som JSON-filer:

```text
server/data/decks/official/
server/data/decks/custom/
```

`server/data/decks/official` er eneste autoritative lager for offisielle kortstokker.

Offisielle kortstokker kan redigeres, men ikke slettes gjennom API-et. Egendefinerte kortstokker kan opprettes, redigeres og slettes.

Spillere og aktiv spilltilstand finnes bare i nettleserminnet og forsvinner ved sideoppdatering.

## Kortstokkformat

Et kortstokkobjekt har følgende implementerte format:

```json
{
  "id": "eksempel",
  "name": "Eksempel",
  "description": "En kort beskrivelse.",
  "minPlayers": 2,
  "maxPlayers": 10,
  "ageRating": "16+",
  "playerCountRule": "any",
  "cards": [
    "{player} skal utføre en oppgave.",
    "{player1} skal beskrive {player2}."
  ],
  "penaltyCards": [
    "Straffekort: Ta en valgfri straff."
  ]
}
```

Gyldige spillerregler:

- `any`: alle spillerantall innenfor intervallet.
- `exact`: minimum og maksimum må være samme tall.
- `even`: intervallet må inneholde et tillatt partall.
- `odd`: intervallet må inneholde et tillatt oddetall.

Se [docs/deck-format.md](docs/deck-format.md) for fullstendig format og valideringsregler.

## Plassholdere

- `{player}` velger neste spiller fra en tilfeldig rekkefølge for kortet.
- Flere `{player}` bruker forskjellige spillere så lenge nok spillere finnes.
- `{player1}`, `{player2}` og andre nummererte varianter beholder samme spiller for alle forekomster av samme token på kortet.

Se [docs/placeholder-system.md](docs/placeholder-system.md) for nøyaktige regler og kanttilfeller.

## API

| Metode | Endepunkt | Funksjon |
| --- | --- | --- |
| `GET` | `/api/decks` | Liste over kortstokker |
| `GET` | `/api/decks/:id` | Hent full kortstokk |
| `POST` | `/api/decks` | Opprett egendefinert kortstokk |
| `PUT` | `/api/decks/:id` | Oppdater offisiell eller egendefinert kortstokk |
| `DELETE` | `/api/decks/:id` | Slett egendefinert kortstokk |

Se [docs/api.md](docs/api.md) for requestformat, responsformat og feiltilfeller.

## Dokumentasjon

- [Arkitektur](docs/architecture.md)
- [API](docs/api.md)
- [Kortstokkformat](docs/deck-format.md)
- [Spillflyt](docs/game-flow.md)
- [Plassholdersystem](docs/placeholder-system.md)
- [Docker](docs/docker.md)
- [Roadmap](docs/roadmap.md)

## Utviklingsregler

Alle endringer skal følge [AGENTS.md](AGENTS.md). Programadferd, API-format og JSON-format skal ikke endres uten at dokumentasjonen oppdateres samtidig.
