# Festens Midtpunkt

Et digitalt kortspill-system bygget som en nettapplikasjon. Prosjektet er laget for å gjøre det enkelt å opprette, redigere og spille forskjellige kortstokker uten å måtte endre kode eller redigere JSON-filer manuelt.

## Hovedfunksjoner

### Spillmotor

* Trekker kort tilfeldig fra valgt kortstokk.
* Kort stokkes automatisk ved oppstart.
* Støtte for spillerbaserte plassholdere.
* Støtte for metadata og spillregler.
* Validering av spillerantall før spillstart.

### Kortstokk-editor

* Opprett nye kortstokker.
* Rediger eksisterende kortstokker.
* Legg til og fjern kort.
* Rediger metadata.
* Lokal lagring i nettleseren.
* Endringer brukes direkte av spillmotoren.

## Kortstokkformat

Eksempel:

```json
{
    "id": "fest",
    "name": "Fest",
    "description": "Kort for fest og sosiale sammenkomster.",
    "minPlayers": 2,
    "maxPlayers": 12,
    "ageRating": "16+",
    "playerCountRule": "any",

    "cards": [
        "{player} må fortelle en morsom historie.",
        "{player} og {player} må samarbeide.",
        "{player1} skal beskrive {player2} med tre ord."
    ]
}
```

## Metadata

| Felt            | Beskrivelse                |
| --------------- | -------------------------- |
| id              | Intern unik identifikator  |
| name            | Navn vist til brukeren     |
| description     | Beskrivelse av kortstokken |
| minPlayers      | Minimum antall spillere    |
| maxPlayers      | Maksimum antall spillere   |
| ageRating       | Anbefalt aldersgrense      |
| playerCountRule | Regler for spillerantall   |
| cards           | Liste over kort            |

### playerCountRule

Mulige verdier:

```text
any
exact
even
odd
```

#### any

Alle antall spillere innenfor minimum og maksimum.

#### exact

Eksakt antall spillere kreves.

#### even

Kun partall.

#### odd

Kun oddetall.

## Plassholdersystem

### Enkel spiller

```text
{player}
```

Trekker en tilfeldig spiller.

Eksempel:

```text
{player} må synge en sang.
```

Resultat:

```text
Sissel må synge en sang.
```

### Flere spillere

```text
{player} og {player} må samarbeide.
```

Motoren velger ulike spillere automatisk.

Resultat:

```text
Sissel og Erlend må samarbeide.
```

### Navngitte spillere

Brukes når samme spiller må refereres til flere ganger.

```text
{player1} skal beskrive {player2}.

Deretter skal {player1} velge neste oppgave for {player2}.
```

Resultat:

```text
Sissel skal beskrive Erlend.

Deretter skal Sissel velge neste oppgave for Erlend.
```

## Lokal lagring

Editoren lagrer kortstokker i nettleserens Local Storage.

Dette betyr:

* Kortstokker beholdes etter oppdatering av siden.
* Kortstokker beholdes etter omstart av nettleseren.
* Kortstokker er lokale for den aktuelle enheten.

Foreløpig lagres ikke data på server.

## Planlagt funksjonalitet

### Kortsiktig

* Dynamisk spillmeny.
* Import av kortstokker.
* Eksport av kortstokker.
* Forbedret mobilgrensesnitt.
* Bekreftelsesdialog ved sletting.

### Langsiktig

* Serverbasert lagring.
* Brukerkontoer.
* Deling av kortstokker.
* Synkronisering mellom enheter.
* Administrasjonspanel.
* Kortstokk-bibliotek.

## Teknologi

* HTML
* CSS
* JavaScript
* JSON
* Local Storage

## Prosjektmål

Målet med prosjektet er å lage en fleksibel plattform for sosiale kortspill hvor nye kortstokker kan opprettes, redigeres og spilles uten programmeringskunnskap.
