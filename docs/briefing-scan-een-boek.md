# Briefing: Scan-een-Boek — Kiosk Applicatie voor Boekhandels

> Versie 2 — bijgewerkt na toevoeging verschijningsdatum, voorraadstatus en recensies-koptekst

---

## Wat is de applicatie?

**Scan-een-Boek** is een digitale kiosk-applicatie bedoeld voor gebruik op een iPad (landscape-modus) in een fysieke boekhandel. Het primaire doel is dat klanten en medewerkers een boek kunnen scannen met een barcode-scanner of mobiele camera, waarna direct alle relevante boekgegevens worden getoond — inclusief prijs, voorraadstatus, genre, omschrijving en recensies.

De applicatie is ontwikkeld voor **Libris** en **BLZ** boekhandels. Beide logo's verschijnen prominent in de header.

**GitHub repository:** https://github.com/GwenaJ/Scan-een-boek

---

## Schermen / Pagina's

### 1. Startpagina (`/`)

**Doel:** De "idle" startpositie van de kiosk. Hier wacht de applicatie op een scan.

**Wat er te zien is:**
- Header met het **Libris-logo**, **BLZ-logo**, en de app-titel *"Barcode scanner"*
- Rechts in de header: een knop om te wisselen tussen **Nederlands** en **Engels**
- Een geanimeerde barcode-scanner afbeelding met een rode scanbeam die op en neer beweegt
- De instructietekst: *"Scan de barcode met de scanner of houd de barcode voor de camera op je mobiel"*
- Een klikbaar gebied om de **camera te activeren**

---

### 2. Boekdetailpagina (`/search?isbn=XXXXXXXXXXX`)

**Doel:** Toont alle informatie over het gevonden boek na een succesvolle scan.

**Indeling (horizontaal op tablet):**

**Links: Boekomslag**
- Afbeelding van de voorkant van het boek
- Als er geen afbeelding beschikbaar is: een boek-icoon als placeholder

**Rechts: Boekgegevens**
- **Titel** (groot, vet)
- **Auteur** (iets kleiner, grijze kleur)
- **Prijs** — het meest prominente element op de pagina (extra groot lettertype, merkkleur)
- **Detailraster** met vijf velden:
  - Formaat (bijv. *Paperback*, *Hardcover*)
  - Taal (bijv. *Nederlands*, *Engels*)
  - Uitgever
  - ISBN-nummer
  - **Verschijningsdatum** (bijv. *1 januari 1999*) *(nieuw)*
- **Voorraadstatus** *(nieuw)*:
  - Groen badge: *"Op voorraad"* (3 of meer exemplaren)
  - Oranje badge: *"Nog [n] beschikbaar"* (1 of 2 exemplaren)
  - Rood badge: *"Niet op voorraad"* (0 exemplaren)
  - Winkellocatie eronder getoond indien aanwezig (bijv. *Locatie: Kinderboeken*)
- **Genre-sectie**: NUR-waarde + Thema-codes

**Recensies** (apart kaartje eronder):
- Koptekst **"RECENSIES"** in kleine vette hoofdletters *(nieuw)*
- Tekst van de recensie(s), indien aanwezig in de database

**Hebban-widget** (onderaan):
- Automatisch ingeladen widget van **hebban.nl** op basis van het ISBN
- Affiliate-ID: `MXOBejPMc`

**Terugknop:** Linksboven een pijl-terug knop → terug naar de startpagina

---

### 3. "Boek niet gevonden" scherm

Wordt getoond als het gescande ISBN niet in de database staat.

- Foutmelding: *"Het boek met ISBN/barcode [ISBN] is niet gevonden in onze database."*
- Knop: *"Nieuwe zoekopdracht"* → terug naar startpagina

---

## Functionaliteiten

### Barcode scannen — twee methodes

**Methode 1: USB barcode-scanner (primair voor kiosk)**
- De applicatie luistert continu naar toetsenbordinvoer
- Een USB-scanner "typt" het barcode-getal razendsnel in (< 50ms per teken)
- Zodra Enter wordt ingedrukt en de invoer ≥ 8 tekens lang is, wordt de scan verwerkt
- Geen extra configuratie nodig — werkt automatisch

**Methode 2: Mobiele camera (fallback)**
- Gebruiker tikt op de scanner-afbeelding om de camera te activeren
- Camera opent in de browser via `@zxing/library`
- Timeout van 30 seconden; daarna verschijnt een melding om het opnieuw te proberen

### Navigatie-flow

```
Startpagina → [scan/type ISBN] → Zoeken... → Boekdetailpagina
                                           ↘ "Niet gevonden" scherm
```

- Na een succesvolle scan gaat de applicatie **direct** naar de boekdetailpagina
- **Na 15 seconden inactiviteit** keert de applicatie automatisch terug naar de startpagina

### Taalwisseling

- Toggle-knop in de header wisselt de volledige interface tussen **Nederlands** en **Engels**
- Alle teksten, labels en foutmeldingen zijn in beide talen beschikbaar
- Standaardtaal: **Nederlands**

---

## Gegevensbronnen

### Database

PostgreSQL-database met **1.272 boeken**, geïmporteerd uit een CSV-bestand.

**Velden per boek:**

| Veldnaam | Beschrijving | Voorbeeld |
|---|---|---|
| `isbn` | ISBN-nummer (primaire sleutel) | `9789026139413` |
| `title` | Boektitel | *Sjakie en de chocoladefabriek* |
| `author` | Auteur(s) | *Roald Dahl* |
| `price` | Verkoopprijs | `12.50` |
| `format` | Fysiek formaat | *midprice* |
| `publisher` | Uitgeverij | *De Fontein Jeugd* |
| `release_date` | Verschijningsdatum | `1999-01-01` |
| `language` | Taal van het boek | *NL* |
| `store_stock` | Aantal exemplaren in de winkel | `2` |
| `store_location` | Locatie in de winkel | *Kinderboeken* |
| `nur` | NUR-code / genre-omschrijving | *Fictie 7+* |
| `thema_codes` | Thema-classificatiecodes | `YFC, YFN` |
| `boekpagina_url` | URL naar de boekpagina (Libris-website) | `https://...` |
| `cover_url` | URL naar de omslagafbeelding | `https://...` |
| `recensies` | Redactionele recensietekst | *"Wat een leuk boek!"* |

### Externe data — Hebban.nl widget

- Script: `https://static.hebban.nl/widget.js`
- Per boek worden het ISBN en het affiliate-ID meegegeven
- **Vereiste affiliate-ID:** `MXOBejPMc`
- Structured data ingeschakeld: `data-structured_data="true"`

---

## Technische context (voor nabouw in Ombreco)

### API-endpoint

Het enige actieve backend-endpoint:

```
GET /api/books/:isbn
```

- Geeft één boek terug op basis van ISBN
- HTTP 404 als het boek niet gevonden wordt
- Responsvelden in camelCase (bijv. `coverUrl`, `themaCodes`, `boekpaginaUrl`, `releaseDate`, `storeStock`, `storeLocation`)

### Logica voorraadstatus

| `storeStock` | Badge-kleur | Tekst (NL) |
|---|---|---|
| ≥ 3 | Groen | Op voorraad |
| 1 of 2 | Oranje | Nog [n] beschikbaar |
| 0 | Rood | Niet op voorraad |

### Beeldmateriaal / Assets

- **Libris-logo** — afbeelding in de header
- **BLZ-logo** — afbeelding in de header
- **Barcode-scanner illustratie** — op de startpagina, met geanimeerde rode scanbeam

### Responsive gedrag

- **iPad landscape (≥ 768px):** Horizontale layout (cover links, info rechts). Prijs in extra groot lettertype.
- **Mobiel (< 768px):** Verticale layout. Cover gecentreerd boven de boekinfo.

### Talen

Alle interfaceteksten beschikbaar in **Nederlands** (standaard) en **Engels**.

---

## Samenvatting voor Ombreco-template

De te bouwen template heeft **twee weergaven**:

1. **Scanscherm** — Idle-scherm met geanimeerde scanner-afbeelding en logica voor barcode-invoer (USB-scanner via keyboard-events, camera via browser API)
2. **Boekdetailscherm** — Detailpagina met:
   - Omslagfoto
   - Titel, auteur, prijs (prominent)
   - Metavelden: formaat, taal, uitgever, ISBN, **verschijningsdatum**
   - **Voorraadstatus** (gekleurde badge + locatie)
   - Genre/thema
   - **"RECENSIES" koptekst** + recensietekst
   - Hebban-widget

De data komt uit een interne database die door het ISBN wordt opgezocht. De Hebban-widget wordt per pagina ingeladen via een extern script. De applicatie keert na 15 seconden inactiviteit automatisch terug naar het scanscherm.
