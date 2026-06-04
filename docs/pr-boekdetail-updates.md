# PR: Boekdetailpagina — verschijningsdatum, voorraadstatus & recensies-label

**Branch:** `main`
**Commit:** `3c077fb4`
**Datum:** 4 juni 2026

---

## Samenvatting

Drie visuele toevoegingen aan de `BookDetail`-component, zodat de kiosk-gebruiker direct meer relevante informatie ziet na het scannen van een boek.

---

## Wijzigingen

### `client/src/components/BookDetail.tsx`

**1. Verschijningsdatum in het detailraster**
- Veld `releaseDate` toegevoegd als vijfde cel in het bestaande 2-koloms grid
- Datumopmaak is taalgebonden: `nl-NL` → "1 januari 1999", `en-GB` → "1 January 1999"
- Veld wordt alleen getoond als `releaseDate` niet null is

**2. Voorraadstatus badge**
- Nieuw blok onder het detailraster, boven de genre-sectie
- Drempelwaarden:
  - `storeStock >= 3` → groene badge, tekst: *"Op voorraad"*
  - `storeStock 1–2` → oranje badge, tekst: *"Nog [n] beschikbaar"*
  - `storeStock === 0` → rode badge, tekst: *"Niet op voorraad"*
- `storeLocation` wordt eronder getoond als het aanwezig is

**3. "RECENSIES" koptekst**
- Label toegevoegd bovenaan het recensies-kaartje
- Stijl: `text-xs font-bold tracking-widest text-muted-foreground`
- Taalgebonden via translation key: `recensiesTitle`

---

### `client/src/lib/translations.ts`

Twee nieuwe vertaalsleutels toegevoegd aan zowel `nl` als `en`:

```ts
stockAvailable: (n: number) => `Nog ${n} beschikbaar`  // nl
stockAvailable: (n: number) => `Only ${n} available`   // en

recensiesTitle: "RECENSIES"  // nl
recensiesTitle: "REVIEWS"    // en
```

---

## Geen breaking changes

- Geen wijzigingen aan de database of het schema
- Geen nieuwe dependencies
- Bestaande vertaalsleutels (`inStock`, `outOfStock`, `location`, `released`) zijn hergebruikt
- Alle nieuwe UI-elementen zijn conditioneel: ze worden alleen getoond als de data beschikbaar is

---

## Testen

Test met een boek dat alle velden heeft, bijv.:

```
/search?isbn=9789026139413
```

Controleer:
- [ ] Verschijningsdatum zichtbaar in het raster ("1 januari 1999")
- [ ] Oranje badge "Nog 2 beschikbaar" zichtbaar
- [ ] Locatie "Kinderboeken" zichtbaar onder de badge
- [ ] Koptekst "RECENSIES" zichtbaar boven de recensietekst
- [ ] Taalwissel (NL ↔ ENG) past alle nieuwe teksten aan
